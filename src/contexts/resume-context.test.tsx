import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ResumeProvider, useResume } from '@/contexts/resume-context';
import { SettingsProvider } from '@/contexts/settings-context';

const { storageMock } = vi.hoisted(() => ({
  storageMock: {
    getResume: vi.fn(),
    createResume: vi.fn(),
    updateResume: vi.fn(),
    getResumeList: vi.fn(() => []),
    deleteResume: vi.fn(),
    duplicateResume: vi.fn(),
  },
}));

vi.mock('@/lib/storage', () => ({
  storage: storageMock,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ResumeProvider>{children}</ResumeProvider>
    </SettingsProvider>
  );
}

describe('ResumeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with sample resume on mount', () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    expect(result.current.resume).not.toBeNull();
    expect(result.current.isValid).toBe(true);
    expect(result.current.yamlText.length).toBeGreaterThan(0);
  });

  it('updates yaml and parses valid resume', () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    const validYaml = `
id: test-resume
name: Test Resume
createdAt: "2024-01-01"
updatedAt: "2024-01-01"
version: 1
basics:
  name: Jane Doe
  email: jane@example.com
education: []
experience:
  - id: exp-1
    company: Acme
    role: Engineer
    location: NYC
    startDate: "2022-01"
    endDate: "2023-01"
    bullets:
      - id: b-1
        text: Did work
projects: []
skills: []
`;

    act(() => {
      result.current.updateYaml(validYaml);
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.resume?.basics.name).toBe('Jane Doe');
  });

  it('sets isValid to false for invalid yaml', () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    act(() => {
      result.current.updateYaml('invalid: yaml: broken: [');
    });

    expect(result.current.isValid).toBe(false);
  });

  it('toggles a bullet on and off', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    const firstExp = resume.experience[0];
    const firstBullet = firstExp.bullets[0];

    const wasSelected = result.current.selectedBullets.get(firstExp.id)?.includes(firstBullet.id);

    act(() => {
      result.current.toggleBullet(firstExp.id, firstBullet.id);
    });

    const isSelected = result.current.selectedBullets.get(firstExp.id)?.includes(firstBullet.id);
    expect(isSelected).toBe(!wasSelected);

    act(() => {
      result.current.toggleBullet(firstExp.id, firstBullet.id);
    });

    const isBack = result.current.selectedBullets.get(firstExp.id)?.includes(firstBullet.id);
    expect(isBack).toBe(wasSelected);
  });

  it('selects all bullets for a parent', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    const firstExp = resume.experience[0];

    act(() => {
      result.current.deselectAllBullets(firstExp.id);
    });

    let selected = result.current.selectedBullets.get(firstExp.id);
    expect(selected?.length ?? 0).toBe(0);

    act(() => {
      result.current.selectAllBullets(firstExp.id);
    });

    selected = result.current.selectedBullets.get(firstExp.id);
    expect(selected?.length).toBe(firstExp.bullets.length);
  });

  it('deselects all bullets for a parent', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    const firstExp = resume.experience[0];

    act(() => {
      result.current.selectAllBullets(firstExp.id);
    });

    let selected = result.current.selectedBullets.get(firstExp.id);
    expect(selected?.length).toBeGreaterThan(0);

    act(() => {
      result.current.deselectAllBullets(firstExp.id);
    });

    selected = result.current.selectedBullets.get(firstExp.id);
    expect(selected?.length ?? 0).toBe(0);
  });

  it('toggles education section items', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    if (resume.education.length === 0) return;

    const eduId = resume.education[0].id;
    const wasSelected = resume.education[0].selected !== false;

    act(() => {
      result.current.toggleSectionItem('education', eduId);
    });

    const afterToggle = result.current.resume!.education[0];
    expect(afterToggle.selected === false).toBe(wasSelected);
  });

  it('toggles skills items by index', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    if (resume.skills.length === 0) return;

    const wasSelected = resume.skills[0].selected !== false;

    act(() => {
      result.current.toggleSectionItem('skills', 0);
    });

    expect(result.current.resume!.skills[0].selected === false).toBe(wasSelected);
  });

  it('ignores invalid skills index', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resumeBefore = result.current.resume;

    act(() => {
      result.current.toggleSectionItem('skills', 999);
    });

    expect(result.current.resume).toEqual(resumeBefore);
  });

  it('toggles basics field visibility', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    act(() => {
      result.current.toggleSectionItem('basics', 'email');
    });

    const hiddenFields = result.current.resume!.basics.hiddenFields;
    expect(hiddenFields).toContain('email');

    act(() => {
      result.current.toggleSectionItem('basics', 'email');
    });

    const hiddenFieldsAfter = result.current.resume!.basics.hiddenFields;
    if (hiddenFieldsAfter) {
      expect(hiddenFieldsAfter.includes('email')).toBe(false);
    }
  });

  it('ignores non-string basics fields', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const before = result.current.resume;

    act(() => {
      result.current.toggleSectionItem('basics', 'summary');
    });

    expect(result.current.resume).toEqual(before);
  });

  it('toggles project section items', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    if (resume.projects.length === 0) return;

    const projId = resume.projects[0].id;
    const wasSelected = resume.projects[0].selected !== false;

    act(() => {
      result.current.toggleSectionItem('project', projId);
    });

    expect(result.current.resume!.projects[0].selected === false).toBe(wasSelected);
  });

  it('moves experience section items', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    if (resume.experience.length < 2) return;

    const firstId = resume.experience[0].id;
    const secondId = resume.experience[1].id;

    act(() => {
      result.current.moveSectionItem('experience', firstId, 'down');
    });

    expect(result.current.resume!.experience[1].id).toBe(firstId);
    expect(result.current.resume!.experience[0].id).toBe(secondId);
  });

  it('moves education section items up', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    if (resume.education.length < 2) return;

    const secondId = resume.education[1].id;

    act(() => {
      result.current.moveSectionItem('education', secondId, 'up');
    });

    expect(result.current.resume!.education[0].id).toBe(secondId);
  });

  it('moves project section items', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    if (resume.projects.length < 2) return;

    act(() => {
      result.current.moveSectionItem('project', resume.projects[0].id, 'down');
    });

    expect(result.current.resume!.projects[1].id).toBe(resume.projects[0].id);
  });

  it('moves skills items by index', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    if (resume.skills.length < 2) return;

    const firstCat = resume.skills[0].category;

    act(() => {
      result.current.moveSectionItem('skills', 0, 'down');
    });

    expect(result.current.resume!.skills[1].category).toBe(firstCat);
  });

  it('moves section items to a specific index', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    if (resume.experience.length < 3) return;

    const lastId = resume.experience[2].id;

    act(() => {
      result.current.moveSectionItemToIndex('experience', lastId, 0);
    });

    expect(result.current.resume!.experience[0].id).toBe(lastId);
  });

  it('updates a bullet text in experience', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    const firstExp = resume.experience[0];
    const firstBullet = firstExp.bullets[0];

    act(() => {
      result.current.updateBullet(firstExp.id, firstBullet.id, 'New bullet text');
    });

    const updated = result.current.resume!.experience[0].bullets[0];
    expect(updated.text).toBe('New bullet text');
  });

  it('updates a bullet text in projects', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    if (resume.projects.length === 0) return;

    const firstProj = resume.projects[0];
    const firstBullet = firstProj.bullets[0];

    act(() => {
      result.current.updateBullet(firstProj.id, firstBullet.id, 'Updated project bullet');
    });

    const updated = result.current.resume!.projects[0].bullets[0];
    expect(updated.text).toBe('Updated project bullet');
  });

  it('does nothing when updating a bullet with non-existent parentId', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const before = result.current.resume;

    act(() => {
      result.current.updateBullet('nonexistent', 'some-bullet', 'text');
    });

    expect(result.current.resume).toEqual(before);
  });

  it('saves resume to storage', async () => {
    storageMock.getResume.mockReturnValue(null);
    storageMock.createResume.mockImplementation(() => {});

    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    act(() => {
      result.current.saveResume();
    });

    expect(storageMock.createResume).toHaveBeenCalled();
  });

  it('updates existing resume in storage on save', async () => {
    storageMock.getResume.mockReturnValue({ id: 'existing' });
    storageMock.updateResume.mockImplementation(() => {});

    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    act(() => {
      result.current.saveResume();
    });

    expect(storageMock.updateResume).toHaveBeenCalled();
  });

  it('loads a resume from storage', async () => {
    const mockResume = {
      id: 'loaded-id',
      name: 'Loaded Resume',
      basics: { name: 'Test', email: 'test@test.com' },
      education: [],
      experience: [],
      projects: [],
      skills: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      version: 1,
    };
    storageMock.getResume.mockReturnValue(mockResume);

    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    act(() => {
      result.current.loadResume('loaded-id');
    });

    expect(result.current.currentResumeId).toBe('loaded-id');
    expect(storageMock.getResume).toHaveBeenCalledWith('loaded-id');
  });

  it('creates a new empty resume', async () => {
    storageMock.createResume.mockImplementation(() => {});

    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const previousId = result.current.currentResumeId;

    act(() => {
      result.current.createNewResume();
    });

    expect(result.current.currentResumeId).not.toBe(previousId);
    expect(storageMock.createResume).toHaveBeenCalled();
  });

  it('throws when useResume is used outside ResumeProvider', () => {
    expect(() => {
      renderHook(() => useResume());
    }).toThrow('useResume must be used within a ResumeProvider');
  });

  it('collects selected bullets from education, experience, and projects', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const resume = result.current.resume!;
    const hasEducation = resume.education.length > 0;
    const hasExperience = resume.experience.length > 0;
    const hasProjects = resume.projects.length > 0;

    expect(result.current.selectedBullets.size).toBeGreaterThanOrEqual(
      (hasEducation ? 1 : 0) + (hasExperience ? 1 : 0) + (hasProjects ? 1 : 0)
    );
  });

  it('syncs bullet toggles back to the resume object and yaml', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const firstExp = result.current.resume!.experience[0];
    const firstBullet = firstExp.bullets[0];
    const yamlBefore = result.current.yamlText;

    act(() => {
      result.current.toggleBullet(firstExp.id, firstBullet.id);
    });

    expect(result.current.yamlText).not.toBe(yamlBefore);
    expect(result.current.isValid).toBe(true);
  });
});
