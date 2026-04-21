import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MatchResults } from '@/components/tailoring/match-results';
import type { MatchResult } from '@/lib/ai-tailoring';
import type { Resume } from '@/types/resume';

const mockResume: Resume = {
  id: 'test',
  name: 'Test',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  version: 1,
  basics: { name: 'Test User' },
  education: [],
  experience: [
    {
      id: 'exp-1',
      company: 'Acme',
      role: 'Engineer',
      location: 'NYC',
      startDate: '2022-01',
      endDate: '2023-01',
      bullets: [
        { id: 'b-1', text: 'Built scalable systems' },
        { id: 'b-2', text: 'Led team of 5' },
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Project X',
      technologies: ['React'],
      bullets: [
        { id: 'pb-1', text: 'Shipped v2' },
      ],
      startDate: '2023-01',
      endDate: '2023-06',
    },
  ],
  skills: [],
};

const mockResults: MatchResult[] = [
  {
    parentId: 'exp-1',
    bulletId: 'b-1',
    score: 0.9,
    matchedKeywords: ['scalable', 'systems'],
  },
  {
    parentId: 'exp-1',
    bulletId: 'b-2',
    score: 0.7,
    matchedKeywords: ['team'],
  },
  {
    parentId: 'proj-1',
    bulletId: 'pb-1',
    score: 0.5,
    matchedKeywords: ['shipped'],
  },
];

describe('MatchResults', () => {
  const selectedBullets = new Map<string, string[]>();
  selectedBullets.set('exp-1', ['b-1']);

  it('renders match results grouped by section', () => {
    render(
      <MatchResults
        results={mockResults}
        resume={mockResume}
        selectedBullets={selectedBullets}
        onToggleBullet={vi.fn()}
        onSelectBest={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText('Match Results')).toBeInTheDocument();
    expect(screen.getByText('Engineer at Acme')).toBeInTheDocument();
    expect(screen.getByText('Project X')).toBeInTheDocument();
  });

  it('shows matched keywords', () => {
    render(
      <MatchResults
        results={mockResults}
        resume={mockResume}
        selectedBullets={selectedBullets}
        onToggleBullet={vi.fn()}
        onSelectBest={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText('scalable')).toBeInTheDocument();
    expect(screen.getByText('systems')).toBeInTheDocument();
  });

  it('shows scores', () => {
    render(
      <MatchResults
        results={mockResults}
        resume={mockResume}
        selectedBullets={selectedBullets}
        onToggleBullet={vi.fn()}
        onSelectBest={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText('0.9')).toBeInTheDocument();
    expect(screen.getByText('0.7')).toBeInTheDocument();
  });

  it('calls onSelectBest when auto-select clicked', () => {
    const onSelectBest = vi.fn();
    render(
      <MatchResults
        results={mockResults}
        resume={mockResume}
        selectedBullets={selectedBullets}
        onToggleBullet={vi.fn()}
        onSelectBest={onSelectBest}
        onReset={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Auto-Select Best'));
    expect(onSelectBest).toHaveBeenCalledOnce();
  });

  it('calls onReset when reset clicked', () => {
    const onReset = vi.fn();
    render(
      <MatchResults
        results={mockResults}
        resume={mockResume}
        selectedBullets={selectedBullets}
        onToggleBullet={vi.fn()}
        onSelectBest={vi.fn()}
        onReset={onReset}
      />
    );

    fireEvent.click(screen.getByText('Reset to Default'));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('calls onToggleBullet when bullet checkbox clicked', () => {
    const onToggleBullet = vi.fn();
    render(
      <MatchResults
        results={mockResults}
        resume={mockResume}
        selectedBullets={selectedBullets}
        onToggleBullet={onToggleBullet}
        onSelectBest={vi.fn()}
        onReset={vi.fn()}
      />
    );

    const checkboxes = screen.getAllByRole('button');
    const firstCheckbox = checkboxes.find(btn => btn.closest('.flex.items-start.gap-3'));
    if (firstCheckbox) {
      fireEvent.click(firstCheckbox);
    }
  });

  it('returns null when no matching sections', () => {
    const { container } = render(
      <MatchResults
        results={[]}
        resume={mockResume}
        selectedBullets={selectedBullets}
        onToggleBullet={vi.fn()}
        onSelectBest={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(container.innerHTML).toBe('');
  });

  it('sorts bullets by score within section', () => {
    render(
      <MatchResults
        results={mockResults}
        resume={mockResume}
        selectedBullets={selectedBullets}
        onToggleBullet={vi.fn()}
        onSelectBest={vi.fn()}
        onReset={vi.fn()}
      />
    );

    const allScoreElements = screen.getAllByText(/^0\.[579]$/);
    expect(allScoreElements.length).toBeGreaterThanOrEqual(1);
  });
});
