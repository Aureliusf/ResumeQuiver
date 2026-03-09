import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { sampleResume, createEmptyResume } from '@/data/sample-resume';
import {
  moveArrayItem,
  moveArrayItemToIndex,
  reorderBasicsFields,
  reorderBasicsFieldsToIndex,
  type BasicFieldKey,
  type MoveDirection,
} from '@/lib/bullet-library';
import { storage } from '@/lib/storage';
import { parseYaml, stringifyYaml } from '@/lib/yaml-utils';
import type { Resume } from '@/types/resume';

type ToggleableSectionKind = 'basics' | 'education' | 'skills';
type MovableSectionKind = 'basics' | ToggleableSectionKind | 'experience' | 'project';

interface ResumeContextState {
  yamlText: string;
  resume: Resume | null;
  selectedBullets: Map<string, string[]>;
  currentResumeId: string | null;
  isValid: boolean;
}

interface ResumeContextActions {
  updateYaml: (text: string) => void;
  toggleBullet: (parentId: string, bulletId: string) => void;
  selectAllBullets: (parentId: string) => void;
  deselectAllBullets: (parentId: string) => void;
  toggleSectionItem: (sectionKind: ToggleableSectionKind, itemId: string | number) => void;
  moveSectionItem: (sectionKind: MovableSectionKind, itemId: string | number, direction: MoveDirection) => void;
  moveSectionItemToIndex: (sectionKind: MovableSectionKind, itemId: string | number, targetIndex: number) => void;
  updateBullet: (parentId: string, bulletId: string, newText: string) => void;
  updateSummary: (newSummary: string) => void;
  saveResume: () => void;
  loadResume: (id: string) => void;
  createNewResume: () => void;
}

type ResumeContextValue = ResumeContextState & ResumeContextActions;

const ResumeContext = createContext<ResumeContextValue | null>(null);

function collectSelectedBullets(resume: Resume): Map<string, string[]> {
  const bullets = new Map<string, string[]>();

  resume.education.forEach((edu) => {
    const selectedIds = edu.bullets.filter((b) => b.selected !== false).map((b) => b.id);
    if (selectedIds.length > 0) {
      bullets.set(edu.id, selectedIds);
    }
  });

  resume.experience.forEach((exp) => {
    const selectedIds = exp.bullets.filter((b) => b.selected !== false).map((b) => b.id);
    if (selectedIds.length > 0) {
      bullets.set(exp.id, selectedIds);
    }
  });

  resume.projects.forEach((proj) => {
    const selectedIds = proj.bullets.filter((b) => b.selected !== false).map((b) => b.id);
    if (selectedIds.length > 0) {
      bullets.set(proj.id, selectedIds);
    }
  });

  return bullets;
}

function applySelectionMapToResume(resume: Resume, selectedMap: Map<string, string[]>): Resume {
  return {
    ...resume,
    education: resume.education.map((edu) => {
      const selectedIds = selectedMap.get(edu.id);
      return {
        ...edu,
        bullets: edu.bullets.map((bullet) => ({
          ...bullet,
          selected: selectedIds ? selectedIds.includes(bullet.id) : bullet.selected !== false,
        })),
      };
    }),
    experience: resume.experience.map((exp) => {
      const selectedIds = selectedMap.get(exp.id);
      return {
        ...exp,
        bullets: exp.bullets.map((bullet) => ({
          ...bullet,
          selected: selectedIds ? selectedIds.includes(bullet.id) : bullet.selected !== false,
        })),
      };
    }),
    projects: resume.projects.map((proj) => {
      const selectedIds = selectedMap.get(proj.id);
      return {
        ...proj,
        bullets: proj.bullets.map((bullet) => ({
          ...bullet,
          selected: selectedIds ? selectedIds.includes(bullet.id) : bullet.selected !== false,
        })),
      };
    }),
  };
}

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [yamlText, setYamlText] = useState<string>('');
  const [resume, setResume] = useState<Resume | null>(null);
  const [selectedBullets, setSelectedBullets] = useState<Map<string, string[]>>(new Map());
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);

  const updateYaml = useCallback((text: string) => {
    setYamlText(text);

    const result = parseYaml(text);
    if (result.success && result.data) {
      setResume(result.data);
      setIsValid(true);
      setSelectedBullets(collectSelectedBullets(result.data));
    } else {
      setIsValid(false);
    }
  }, []);

  const syncSelectionToResume = useCallback((nextMap: Map<string, string[]>) => {
    setResume((prevResume) => {
      if (!prevResume) return prevResume;
      const nextResume = applySelectionMapToResume(prevResume, nextMap);
      setYamlText(stringifyYaml(nextResume));
      setIsValid(true);
      return nextResume;
    });
  }, []);

  const commitResumeUpdate = useCallback((nextResume: Resume) => {
    setYamlText(stringifyYaml(nextResume));
    setSelectedBullets(collectSelectedBullets(nextResume));
    setIsValid(true);
    return nextResume;
  }, []);

  const toggleBullet = useCallback((parentId: string, bulletId: string) => {
    setSelectedBullets((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(parentId) || [];

      if (current.includes(bulletId)) {
        newMap.set(
          parentId,
          current.filter((id) => id !== bulletId)
        );
      } else {
        newMap.set(parentId, [...current, bulletId]);
      }

      syncSelectionToResume(newMap);
      return newMap;
    });
  }, [syncSelectionToResume]);

  const selectAllBullets = useCallback((parentId: string) => {
    setSelectedBullets((prev) => {
      const newMap = new Map(prev);

      if (!resume) return newMap;

      const edu = resume.education.find((e) => e.id === parentId);
      if (edu) {
        newMap.set(parentId, edu.bullets.map((b) => b.id));
      }

      const exp = resume.experience.find((e) => e.id === parentId);
      if (exp) {
        newMap.set(parentId, exp.bullets.map((b) => b.id));
      }

      const proj = resume.projects.find((p) => p.id === parentId);
      if (proj) {
        newMap.set(parentId, proj.bullets.map((b) => b.id));
      }

      syncSelectionToResume(newMap);
      return newMap;
    });
  }, [resume, syncSelectionToResume]);

  const deselectAllBullets = useCallback((parentId: string) => {
    setSelectedBullets((prev) => {
      const newMap = new Map(prev);
      newMap.set(parentId, []);
      syncSelectionToResume(newMap);
      return newMap;
    });
  }, [syncSelectionToResume]);

  const toggleSectionItem = useCallback((sectionKind: ToggleableSectionKind, itemId: string | number) => {
    setResume((prevResume) => {
      if (!prevResume) return prevResume;

      if (sectionKind === 'education' && typeof itemId === 'string') {
        let updated = false;
        const nextResume: Resume = {
          ...prevResume,
          education: prevResume.education.map((entry) => {
            if (entry.id !== itemId) return entry;
            updated = true;
            return {
              ...entry,
              selected: entry.selected === false,
            };
          }),
        };

        return updated ? commitResumeUpdate(nextResume) : prevResume;
      }

      if (sectionKind === 'basics' && typeof itemId === 'string') {
        const fieldKey = itemId as BasicFieldKey;
        if (typeof prevResume.basics[fieldKey] !== 'string') {
          return prevResume;
        }

        const hiddenFields = new Set(prevResume.basics.hiddenFields ?? []);
        if (hiddenFields.has(fieldKey)) {
          hiddenFields.delete(fieldKey);
        } else {
          hiddenFields.add(fieldKey);
        }

        const nextHiddenFields = Array.from(hiddenFields);
        const nextBasics = {
          ...prevResume.basics,
          ...(nextHiddenFields.length > 0 ? { hiddenFields: nextHiddenFields } : {}),
        };

        if (nextHiddenFields.length === 0 && 'hiddenFields' in nextBasics) {
          delete nextBasics.hiddenFields;
        }

        return commitResumeUpdate({
          ...prevResume,
          basics: nextBasics,
        });
      }

      if (sectionKind === 'skills') {
        const index = typeof itemId === 'number' ? itemId : Number(itemId);
        if (!Number.isInteger(index) || index < 0 || index >= prevResume.skills.length) {
          return prevResume;
        }

        const nextResume: Resume = {
          ...prevResume,
          skills: prevResume.skills.map((entry, entryIndex) => {
            if (entryIndex !== index) return entry;
            return {
              ...entry,
              selected: entry.selected === false,
            };
          }),
        };

        return commitResumeUpdate(nextResume);
      }

      return prevResume;
    });
  }, [commitResumeUpdate]);

  const moveSectionItem = useCallback((
    sectionKind: MovableSectionKind,
    itemId: string | number,
    direction: MoveDirection
  ) => {
    setResume((prevResume) => {
      if (!prevResume) return prevResume;

      if (sectionKind === 'basics' && typeof itemId === 'string') {
        const nextBasics = reorderBasicsFields(prevResume.basics, itemId as BasicFieldKey, direction);
        if (nextBasics === prevResume.basics) {
          return prevResume;
        }

        return commitResumeUpdate({
          ...prevResume,
          basics: nextBasics,
        });
      }

      if (sectionKind === 'education' && typeof itemId === 'string') {
        const index = prevResume.education.findIndex((entry) => entry.id === itemId);
        const nextEducation = moveArrayItem(prevResume.education, index, direction);

        if (nextEducation === prevResume.education) {
          return prevResume;
        }

        return commitResumeUpdate({
          ...prevResume,
          education: nextEducation,
        });
      }

      if (sectionKind === 'experience' && typeof itemId === 'string') {
        const index = prevResume.experience.findIndex((entry) => entry.id === itemId);
        const nextExperience = moveArrayItem(prevResume.experience, index, direction);

        if (nextExperience === prevResume.experience) {
          return prevResume;
        }

        return commitResumeUpdate({
          ...prevResume,
          experience: nextExperience,
        });
      }

      if (sectionKind === 'project' && typeof itemId === 'string') {
        const index = prevResume.projects.findIndex((entry) => entry.id === itemId);
        const nextProjects = moveArrayItem(prevResume.projects, index, direction);

        if (nextProjects === prevResume.projects) {
          return prevResume;
        }

        return commitResumeUpdate({
          ...prevResume,
          projects: nextProjects,
        });
      }

      if (sectionKind === 'skills') {
        const index = typeof itemId === 'number' ? itemId : Number(itemId);
        const nextSkills = moveArrayItem(prevResume.skills, index, direction);

        if (nextSkills === prevResume.skills) {
          return prevResume;
        }

        return commitResumeUpdate({
          ...prevResume,
          skills: nextSkills,
        });
      }

      return prevResume;
    });
  }, [commitResumeUpdate]);

  const moveSectionItemToIndex = useCallback((
    sectionKind: MovableSectionKind,
    itemId: string | number,
    targetIndex: number
  ) => {
    setResume((prevResume) => {
      if (!prevResume) return prevResume;

      if (sectionKind === 'basics' && typeof itemId === 'string') {
        const nextBasics = reorderBasicsFieldsToIndex(prevResume.basics, itemId as BasicFieldKey, targetIndex);
        if (nextBasics === prevResume.basics) {
          return prevResume;
        }

        return commitResumeUpdate({
          ...prevResume,
          basics: nextBasics,
        });
      }

      if (sectionKind === 'education' && typeof itemId === 'string') {
        const index = prevResume.education.findIndex((entry) => entry.id === itemId);
        const nextEducation = moveArrayItemToIndex(prevResume.education, index, targetIndex);

        if (nextEducation === prevResume.education) {
          return prevResume;
        }

        return commitResumeUpdate({
          ...prevResume,
          education: nextEducation,
        });
      }

      if (sectionKind === 'experience' && typeof itemId === 'string') {
        const index = prevResume.experience.findIndex((entry) => entry.id === itemId);
        const nextExperience = moveArrayItemToIndex(prevResume.experience, index, targetIndex);

        if (nextExperience === prevResume.experience) {
          return prevResume;
        }

        return commitResumeUpdate({
          ...prevResume,
          experience: nextExperience,
        });
      }

      if (sectionKind === 'project' && typeof itemId === 'string') {
        const index = prevResume.projects.findIndex((entry) => entry.id === itemId);
        const nextProjects = moveArrayItemToIndex(prevResume.projects, index, targetIndex);

        if (nextProjects === prevResume.projects) {
          return prevResume;
        }

        return commitResumeUpdate({
          ...prevResume,
          projects: nextProjects,
        });
      }

      if (sectionKind === 'skills') {
        const index = typeof itemId === 'number' ? itemId : Number(itemId);
        const nextSkills = moveArrayItemToIndex(prevResume.skills, index, targetIndex);

        if (nextSkills === prevResume.skills) {
          return prevResume;
        }

        return commitResumeUpdate({
          ...prevResume,
          skills: nextSkills,
        });
      }

      return prevResume;
    });
  }, [commitResumeUpdate]);

  const updateBullet = useCallback((parentId: string, bulletId: string, newText: string) => {
    setResume((prevResume) => {
      if (!prevResume) return prevResume;

      let updated = false;

      const nextResume: Resume = {
        ...prevResume,
        education: prevResume.education.map((edu) => {
          if (edu.id !== parentId) return edu;
          return {
            ...edu,
            bullets: edu.bullets.map((bullet) => {
              if (bullet.id !== bulletId) return bullet;
              updated = true;
              return { ...bullet, text: newText };
            }),
          };
        }),
        experience: prevResume.experience.map((exp) => {
          if (exp.id !== parentId) return exp;
          return {
            ...exp,
            bullets: exp.bullets.map((bullet) => {
              if (bullet.id !== bulletId) return bullet;
              updated = true;
              return { ...bullet, text: newText };
            }),
          };
        }),
        projects: prevResume.projects.map((proj) => {
          if (proj.id !== parentId) return proj;
          return {
            ...proj,
            bullets: proj.bullets.map((bullet) => {
              if (bullet.id !== bulletId) return bullet;
              updated = true;
              return { ...bullet, text: newText };
            }),
          };
        }),
      };

      if (!updated) return prevResume;

      return commitResumeUpdate(nextResume);
    });
  }, [commitResumeUpdate]);

  const updateSummary = useCallback((newSummary: string) => {
    if (!resume) return;

    const lines = yamlText.split('\n');
    let inBasics = false;
    let summaryLineIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine === 'basics:') {
        inBasics = true;
        continue;
      }
      
      if (inBasics) {
        const match = line.match(/^(\s*)/);
        const indent = match ? match[1].length : 0;
        
        if (trimmedLine.startsWith('summary:')) {
          summaryLineIndex = i;
          break;
        }
        
        if (indent === 0 && trimmedLine.endsWith(':') && !trimmedLine.startsWith('#')) {
          inBasics = false;
        }
      }
    }
    
    if (summaryLineIndex !== -1) {
      const indent = lines[summaryLineIndex].match(/^(\s*)/)?.[1] || '';
      const baseIndent = indent + '  ';
      
      // Handle multiline summary with YAML block scalar
      lines[summaryLineIndex] = `${indent}summary: >-`;
      
      // Remove any existing continuation lines for summary
      let j = summaryLineIndex + 1;
      while (j < lines.length) {
        const line = lines[j];
        const trimmedLine = line.trim();
        const match = line.match(/^(\s*)/);
        const lineIndent = match ? match[1].length : 0;
        
        // If we hit a line at the same or lower indent level that's not empty, stop
        if (lineIndent <= indent.length && trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
          break;
        }
        
        // If it's a continuation line, remove it
        if (lineIndent > indent.length || (trimmedLine.length === 0 && j > summaryLineIndex + 1)) {
          lines.splice(j, 1);
        } else {
          j++;
        }
      }
      
      // Add new summary lines
      const summaryLines = newSummary.split('\n').filter(line => line.trim());
      const indentedSummary = summaryLines.map(line => `${baseIndent}${line.trim()}`);
      lines.splice(summaryLineIndex + 1, 0, ...indentedSummary);
      
      const newYaml = lines.join('\n');
      updateYaml(newYaml);
    }
  }, [resume, yamlText, updateYaml]);

  const saveResume = useCallback(() => {
    if (!resume) return;

    const existing = storage.getResume(resume.id);
    if (existing) {
      storage.updateResume(resume.id, {
        ...resume,
        updatedAt: new Date().toISOString(),
      });
    } else {
      storage.createResume({
        name: resume.name,
        basics: resume.basics,
        education: resume.education,
        experience: resume.experience,
        projects: resume.projects,
        skills: resume.skills,
      });
    }
  }, [resume]);

  const loadResume = useCallback((id: string) => {
    const loaded = storage.getResume(id);
    if (loaded) {
      setResume(loaded);
      setCurrentResumeId(loaded.id);
      setYamlText(stringifyYaml(loaded));
      setIsValid(true);
      setSelectedBullets(collectSelectedBullets(loaded));
    }
  }, []);

  const createNewResume = useCallback(() => {
    const newResume = createEmptyResume();
    setResume(newResume);
    setCurrentResumeId(newResume.id);
    setYamlText(stringifyYaml(newResume));
    setIsValid(true);
    setSelectedBullets(new Map());

    storage.createResume({
      name: newResume.name,
      basics: newResume.basics,
      education: newResume.education,
      experience: newResume.experience,
      projects: newResume.projects,
      skills: newResume.skills,
    });
  }, []);

  useEffect(() => {
    const yaml = stringifyYaml(sampleResume);
    setYamlText(yaml);
    setResume(sampleResume);
    setCurrentResumeId(sampleResume.id);
    setIsValid(true);
    setSelectedBullets(collectSelectedBullets(sampleResume));
  }, []);

  const value = useMemo(
    () => ({
      yamlText,
      resume,
      selectedBullets,
      currentResumeId,
      isValid,
      updateYaml,
      toggleBullet,
      selectAllBullets,
      deselectAllBullets,
      toggleSectionItem,
      moveSectionItem,
      moveSectionItemToIndex,
      updateBullet,
      updateSummary,
      saveResume,
      loadResume,
      createNewResume,
    }),
    [
      yamlText,
      resume,
      selectedBullets,
      currentResumeId,
      isValid,
      updateYaml,
      toggleBullet,
      selectAllBullets,
      deselectAllBullets,
      toggleSectionItem,
      moveSectionItem,
      moveSectionItemToIndex,
      updateBullet,
      updateSummary,
      saveResume,
      loadResume,
      createNewResume,
    ]
  );

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
