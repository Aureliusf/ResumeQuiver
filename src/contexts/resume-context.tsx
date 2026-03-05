import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { sampleResume, createEmptyResume } from '@/data/sample-resume';
import { storage } from '@/lib/storage';
import { parseYaml, stringifyYaml } from '@/lib/yaml-utils';
import type { Resume } from '@/types/resume';

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
  updateBullet: (parentId: string, bulletId: string, newText: string) => void;
  updateSummary: (newSummary: string) => void;
  saveResume: () => void;
  loadResume: (id: string) => void;
  createNewResume: () => void;
}

type ResumeContextValue = ResumeContextState & ResumeContextActions;

const ResumeContext = createContext<ResumeContextValue | null>(null);

function collectAllBullets(resume: Resume): Map<string, string[]> {
  const bullets = new Map<string, string[]>();

  resume.experience.forEach((exp) => {
    const bulletIds = exp.bullets.map((b) => b.id);
    if (bulletIds.length > 0) {
      bullets.set(exp.id, bulletIds);
    }
  });

  resume.projects.forEach((proj) => {
    const bulletIds = proj.bullets.map((b) => b.id);
    if (bulletIds.length > 0) {
      bullets.set(proj.id, bulletIds);
    }
  });

  return bullets;
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
    } else {
      setIsValid(false);
    }
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

      return newMap;
    });
  }, []);

  const selectAllBullets = useCallback((parentId: string) => {
    setSelectedBullets((prev) => {
      const newMap = new Map(prev);

      if (!resume) return newMap;

      const exp = resume.experience.find((e) => e.id === parentId);
      if (exp) {
        newMap.set(parentId, exp.bullets.map((b) => b.id));
      }

      const proj = resume.projects.find((p) => p.id === parentId);
      if (proj) {
        newMap.set(parentId, proj.bullets.map((b) => b.id));
      }

      return newMap;
    });
  }, [resume]);

  const deselectAllBullets = useCallback((parentId: string) => {
    setSelectedBullets((prev) => {
      const newMap = new Map(prev);
      newMap.set(parentId, []);
      return newMap;
    });
  }, []);

  const updateBullet = useCallback((parentId: string, bulletId: string, newText: string) => {
    if (!resume) return;

    // Find the parent (experience or project)
    const exp = resume.experience.find((e) => e.id === parentId);
    const proj = resume.projects.find((p) => p.id === parentId);
    
    if (!exp && !proj) return;
    
    // Find the bullet
    const bullets = exp ? exp.bullets : proj!.bullets;
    const bullet = bullets.find((b) => b.id === bulletId);
    
    if (!bullet) return;
    
    // Update the YAML text
    const oldText = bullet.text;
    const lines = yamlText.split('\n');
    
    // Find the line containing the bullet text
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(oldText)) {
        lines[i] = lines[i].replace(oldText, newText);
        break;
      }
    }
    
    const newYaml = lines.join('\n');
    updateYaml(newYaml);
  }, [resume, yamlText, updateYaml]);

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
      setSelectedBullets(collectAllBullets(loaded));
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
    setSelectedBullets(collectAllBullets(sampleResume));
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
