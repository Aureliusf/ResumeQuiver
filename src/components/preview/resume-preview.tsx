import { useResume } from '@/contexts/resume-context';
import { formatDateRange } from '@/lib/date-utils';
import '@/styles/resume.css';

export function ResumePreview() {
  const { resume, selectedBullets } = useResume();

  if (!resume) {
    return (
      <div className="flex items-center justify-center h-64 text-df-text-secondary">
        No resume data available
      </div>
    );
  }

  const getSelectedBullets = (parentId: string, bullets: { id: string; text: string }[]) => {
    const selectedIds = selectedBullets.get(parentId) || [];
    return bullets.filter((b) => selectedIds.includes(b.id));
  };

  // Build contact line
  const contactItems: string[] = [];
  if (resume.basics.email) contactItems.push(resume.basics.email);
  if (resume.basics.phone) contactItems.push(resume.basics.phone);
  if (resume.basics.location) contactItems.push(resume.basics.location);
  if (resume.basics.website) contactItems.push(resume.basics.website);
  if (resume.basics.linkedin) contactItems.push(resume.basics.linkedin);
  if (resume.basics.github) contactItems.push(resume.basics.github);

  return (
    <div className="resume-paper resume-paper-preview">
      {/* Header */}
      <header className="resume-header">
        <h1 className="resume-name">{resume.basics.name}</h1>
        <div className="resume-contact">
          {contactItems.join(' \\ ').replace(/\\/g, ' | ')}
        </div>
      </header>

      {/* Education */}
      {resume.education.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Education</h2>
          {resume.education.map((edu) => (
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
            </div>
          ))}
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Experience</h2>
          {resume.experience.map((exp) => {
            const selected = getSelectedBullets(exp.id, exp.bullets);
            if (selected.length === 0) return null;

            return (
              <div key={exp.id} className="resume-experience-entry">
                <div className="resume-row">
                  <span className="resume-row-left resume-role">{exp.role}</span>
                  <span className="resume-row-right resume-dates">
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </span>
                </div>
                <div className="resume-row">
                  <span className="resume-row-left resume-company">
                    {exp.company} | {exp.location}
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

      {/* Projects */}
      {resume.projects.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Projects</h2>
          {resume.projects.map((proj) => {
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
      {resume.skills.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Technical Skills</h2>
          <div className="resume-skills">
            {resume.skills.map((skill) => (
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
}
