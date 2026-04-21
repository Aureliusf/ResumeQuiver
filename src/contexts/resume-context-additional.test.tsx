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

describe('ResumeContext - updateSummary', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('updates summary in yaml when summary line exists', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const yamlWithSummary = `
id: test-resume
name: Test
createdAt: "2024-01-01"
updatedAt: "2024-01-01"
version: 1
basics:
  name: Jane Doe
  email: jane@example.com
  summary: Original summary text
education: []
experience: []
projects: []
skills: []
`;

    act(() => {
      result.current.updateYaml(yamlWithSummary);
    });

    act(() => {
      result.current.updateSummary('New and improved summary');
    });

    expect(result.current.yamlText).toContain('summary');
    expect(result.current.isValid).toBe(true);
  });

  it('does nothing when resume is null', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const yamlBefore = result.current.yamlText;

    act(() => {
      result.current.updateSummary('New summary');
    });

    expect(result.current.yamlText).toBe(yamlBefore);
  });
});

describe('ResumeContext - moveSectionItemToIndex', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('moves basics fields to a specific index', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const yamlWithBasics = `
id: test-resume
name: Test
createdAt: "2024-01-01"
updatedAt: "2024-01-01"
version: 1
basics:
  name: Jane Doe
  email: jane@example.com
  phone: "555-1234"
  location: NYC
  website: https://example.com
education: []
experience: []
projects: []
skills: []
`;

    act(() => {
      result.current.updateYaml(yamlWithBasics);
    });

    act(() => {
      result.current.moveSectionItemToIndex('basics', 'website', 0);
    });

    expect(result.current.isValid).toBe(true);
  });

  it('moves education items to a specific index', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const yamlWithEd = `
id: test-resume
name: Test
createdAt: "2024-01-01"
updatedAt: "2024-01-01"
version: 1
basics:
  name: Jane Doe
education:
  - id: edu-1
    school: MIT
    location: Cambridge
    degree: BS CS
    dates: 2018-2022
    bullets:
      - id: eb-1
        text: Good grades
  - id: edu-2
    school: Stanford
    location: Palo Alto
    degree: MS CS
    dates: 2022-2024
    bullets:
      - id: eb-2
        text: Research
experience: []
projects: []
skills: []
`;

    act(() => {
      result.current.updateYaml(yamlWithEd);
    });

    act(() => {
      result.current.moveSectionItemToIndex('education', 'edu-2', 0);
    });

    expect(result.current.resume!.education[0].id).toBe('edu-2');
  });

  it('moves experience items to a specific index', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const yamlWithExp = `
id: test-resume
name: Test
createdAt: "2024-01-01"
updatedAt: "2024-01-01"
version: 1
basics:
  name: Jane Doe
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
  - id: exp-2
    company: Beta
    role: Senior
    location: SF
    startDate: "2023-01"
    endDate: "2024-01"
    bullets:
      - id: b-2
        text: More work
projects: []
skills: []
`;

    act(() => {
      result.current.updateYaml(yamlWithExp);
    });

    act(() => {
      result.current.moveSectionItemToIndex('experience', 'exp-2', 0);
    });

    expect(result.current.resume!.experience[0].id).toBe('exp-2');
  });

  it('moves project items to a specific index', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const yamlWithProj = `
id: test-resume
name: Test
createdAt: "2024-01-01"
updatedAt: "2024-01-01"
version: 1
basics:
  name: Jane Doe
education: []
experience: []
projects:
  - id: proj-1
    name: Project A
    technologies: [React]
    bullets:
      - id: pb-1
        text: Shipped v1
    startDate: "2023-01"
    endDate: "2023-06"
  - id: proj-2
    name: Project B
    technologies: [TypeScript]
    bullets:
      - id: pb-2
        text: Shipped v2
    startDate: "2023-06"
    endDate: "2024-01"
skills: []
`;

    act(() => {
      result.current.updateYaml(yamlWithProj);
    });

    act(() => {
      result.current.moveSectionItemToIndex('project', 'proj-2', 0);
    });

    expect(result.current.resume!.projects[0].id).toBe('proj-2');
  });

  it('moves skill items to a specific index', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const yamlWithSkills = `
id: test-resume
name: Test
createdAt: "2024-01-01"
updatedAt: "2024-01-01"
version: 1
basics:
  name: Jane Doe
education: []
experience: []
projects: []
skills:
  - category: Languages
    items: [Python, JavaScript]
  - category: Frameworks
    items: [React, Django]
  - category: Tools
    items: [Git, Docker]
`;

    act(() => {
      result.current.updateYaml(yamlWithSkills);
    });

    act(() => {
      result.current.moveSectionItemToIndex('skills', 2, 0);
    });

    expect(result.current.resume!.skills[0].category).toBe('Tools');
  });
});

describe('ResumeContext - updateBullet in education', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('updates a bullet text in education', async () => {
    const { result } = renderHook(() => useResume(), { wrapper });

    const yamlWithEdu = `
id: test-resume
name: Test
createdAt: "2024-01-01"
updatedAt: "2024-01-01"
version: 1
basics:
  name: Jane Doe
education:
  - id: edu-1
    school: MIT
    location: Cambridge
    degree: BS CS
    dates: 2018-2022
    bullets:
      - id: eb-1
        text: Good grades
experience: []
projects: []
skills: []
`;

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    act(() => {
      result.current.updateYaml(yamlWithEdu);
    });

    act(() => {
      result.current.updateBullet('edu-1', 'eb-1', 'Excellent GPA');
    });

    const edu = result.current.resume!.education[0];
    expect(edu.bullets[0].text).toBe('Excellent GPA');
  });
});

describe('ResumeContext - loadResume non-existent', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('does nothing when resume not found in storage', async () => {
    storageMock.getResume.mockReturnValue(null);

    const { result } = renderHook(() => useResume(), { wrapper });

    await waitFor(() => expect(result.current.resume).not.toBeNull());

    const prevId = result.current.currentResumeId;

    act(() => {
      result.current.loadResume('nonexistent');
    });

    expect(result.current.currentResumeId).toBe(prevId);
  });
});
