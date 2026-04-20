import { useResume } from '@/contexts/resume-context';
import {
  getBasicsFieldEntries,
  getVisibleEducationEntries,
  getVisibleProjectEntries,
  getVisibleSkillCategories,
} from '@/lib/bullet-library';
import { formatDateRange } from '@/lib/date-utils';
import { forwardRef } from 'react';
import '@/styles/resume.css';

interface ResumePreviewProps {
  isDarkMode?: boolean;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ isDarkMode = false }, ref) => {
  const { resume, selectedBullets } = useResume();

  if (!resume) {
    return (
      <div className="flex items-center justify-center h-64 text-df-text-secondary">
        No resume data available
      </div>
    );
  }

  const getSelectedBullets = (parentId: string, bullets: { id: string; text: string; selected?: boolean }[]) => {
    const selectedIds = selectedBullets.get(parentId);
    if (selectedIds) {
      return bullets.filter((b) => selectedIds.includes(b.id));
    }
    return bullets.filter((b) => b.selected !== false);
  };

  // Build contact line
  const contactItems = getBasicsFieldEntries(resume.basics).map((entry) => entry.value);
  const visibleEducation = getVisibleEducationEntries(resume.education);
  const visibleProjects = getVisibleProjectEntries(resume.projects);
  const visibleSkills = getVisibleSkillCategories(resume.skills);

  return (
    <div ref={ref} className={`resume-paper resume-paper-preview${isDarkMode ? ' resume-paper-preview-dark' : ''}`}>
      {/* Header */}
      <header className="resume-header">
        <h1 className="resume-name">{resume.basics.name}</h1>
        <div className="resume-contact">
          {contactItems.join(' \\ ').replace(/\\/g, ' | ')}
        </div>
      </header>

      {/* Education */}
      {visibleEducation.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Education</h2>
          {visibleEducation.map((edu) => {
            const selected = getSelectedBullets(edu.id, edu.bullets);
            return (
              <div key={edu.id} className="resume-education-entry">
                <div className="resume-row">
                  <span className="resume-row-left">
                    <span className="resume-school">{edu.school}</span>
                    <span className="resume-location"> | {edu.location}</span>
                  </span>
                </div>
                <div className="resume-row">
                  <span className="resume-row-left resume-degree">{edu.degree}</span>
                  <span className="resume-row-right resume-dates">{edu.dates}</span>
                </div>
                {selected.length > 0 && (
                  <ul className="resume-bullets">
                    {selected.map((bullet) => (
                      <li key={bullet.id}>{bullet.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Experience</h2>
          {resume.experience.map((exp) => {
            const selected = getSelectedBullets(exp.id, exp.bullets);
            if (selected.length === 0) return null;
            const experienceMeta = [exp.location, formatDateRange(exp.startDate, exp.endDate)]
              .filter(Boolean)
              .join(' | ');

            return (
              <div key={exp.id} className="resume-experience-entry">
                <div className="resume-row">
                  <span className="resume-row-left resume-role">{exp.role}</span>
                  <span className="resume-row-right resume-dates">{experienceMeta}</span>
                </div>
                <div className="resume-row">
                  <span className="resume-row-left resume-company">{exp.company}</span>
                </div>
                <ul className="resume-bullets">
                  {selected.map((bullet) => (
                    <li key={bullet.id}>{bullet.text}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {/* Projects */}
      {visibleProjects.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Projects</h2>
          {visibleProjects.map((proj) => {
            const selected = getSelectedBullets(proj.id, proj.bullets);
            if (selected.length === 0) return null;

            return (
              <div key={proj.id} className="resume-project-entry">
                <div className="resume-row">
                  <span className="resume-row-left">
                    <span className="resume-project-name">{proj.name}</span>
                    {proj.technologies.length > 0 && (
                      <span className="resume-project-tech">
                        {' '}
                        | {proj.technologies.join(', ')}
                      </span>
                    )}
                  </span>
                  <span className="resume-row-right resume-dates">
                    {formatDateRange(proj.startDate, proj.endDate)}
                  </span>
                </div>
                <ul className="resume-bullets">
                  {selected.map((bullet) => (
                    <li key={bullet.id}>{bullet.text}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {/* Technical Skills */}
      {visibleSkills.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Technical Skills</h2>
          <div className="resume-skills">
            {visibleSkills.map((skill) => (
              <div key={skill.category}>
                <span className="resume-skill-category">{skill.category}:</span>{' '}
                <span className="resume-skill-items">{skill.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
