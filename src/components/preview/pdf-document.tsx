import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Resume } from '@/types/resume';

// Register Times Roman font (built into react-pdf)
// Times-Roman is available by default

interface PDFDocumentProps {
  resume: Resume;
  selectedBullets: Map<string, string[]>;
}

// Create styles that match Jake's Resume template
const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingHorizontal: 36,
    paddingBottom: 36,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.4,
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    fontVariant: 'small-caps',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  contact: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#333333',
  },
  section: {
    marginTop: 14,
    marginBottom: 11,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontVariant: 'small-caps',
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    marginBottom: 8,
  },
  entry: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowLeft: {
    flex: 1,
  },
  rowRight: {
    textAlign: 'right',
  },
  school: {
    fontWeight: 'bold',
  },
  location: {
    fontWeight: 'normal',
  },
  degree: {
    fontStyle: 'italic',
  },
  dates: {
    fontStyle: 'italic',
    fontSize: 11,
  },
  role: {
    fontWeight: 'bold',
  },
  company: {
    fontStyle: 'italic',
  },
  projectName: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  bullets: {
    marginTop: 4,
    marginLeft: 14,
  },
  bullet: {
    fontSize: 12,
    marginBottom: 2,
  },
  bulletBullet: {
    width: 6,
    marginRight: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  skillCategory: {
    fontWeight: 'bold',
  },
  skillItems: {
    fontWeight: 'normal',
  },
});

export function PDFDocument({ resume, selectedBullets }: PDFDocumentProps) {
  const getSelectedBullets = (parentId: string, bullets: { id: string; text: string; selected?: boolean }[]) => {
    const selectedIds = selectedBullets.get(parentId);
    
    // If we have selection state in the Map, use it
    if (selectedIds !== undefined) {
      return bullets.filter((b) => selectedIds.includes(b.id));
    }
    
    // Otherwise, fall back to the bullet's own selected field (defaults to true)
    return bullets.filter((b) => b.selected !== false);
  };

  // Build contact line
  const contactItems: string[] = [];
  if (resume.basics.email) contactItems.push(resume.basics.email);
  if (resume.basics.phone) contactItems.push(resume.basics.phone);
  if (resume.basics.location) contactItems.push(resume.basics.location);
  if (resume.basics.website) contactItems.push(resume.basics.website);
  if (resume.basics.linkedin) contactItems.push(resume.basics.linkedin);
  if (resume.basics.github) contactItems.push(resume.basics.github);

  const formatDateRange = (startDate: string, endDate: string): string => {
    const formatDate = (date: string): string => {
      if (!date || date === 'Present') return 'Present';
      const [year, month] = date.split('-');
      const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
      const monthIdx = parseInt(month, 10) - 1;
      return `${months[monthIdx]} ${year}`;
    };

    const start = formatDate(startDate);
    const end = endDate === 'Present' ? 'Present' : formatDate(endDate);
    return `${start} -- ${end}`;
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.basics.name}</Text>
          <Text style={styles.contact}>
            {contactItems.join(' | ')}
          </Text>
        </View>

        {/* Education */}
        {resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu) => (
              <View key={edu.id} style={styles.entry}>
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Text>
                      <Text style={styles.school}>{edu.school}</Text>
                      <Text style={styles.location}> | {edu.location}</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.rowLeft, styles.degree]}>{edu.degree}</Text>
                  <Text style={[styles.rowRight, styles.dates]}>{edu.dates}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp) => {
              const selected = getSelectedBullets(exp.id, exp.bullets);
              if (selected.length === 0) return null;

              return (
                <View key={exp.id} style={styles.entry}>
                  <View style={styles.row}>
                    <Text style={[styles.rowLeft, styles.role]}>{exp.role}</Text>
                    <Text style={[styles.rowRight, styles.dates]}>
                      {formatDateRange(exp.startDate, exp.endDate)}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.rowLeft, styles.company]}>
                      {exp.company} | {exp.location}
                    </Text>
                  </View>
                  <View style={styles.bullets}>
                    {selected.map((bullet) => (
                      <View key={bullet.id} style={styles.bulletRow}>
                        <Text style={styles.bulletBullet}>•</Text>
                        <Text style={styles.bullet}>{bullet.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((proj) => {
              const selected = getSelectedBullets(proj.id, proj.bullets);
              if (selected.length === 0) return null;

              return (
                <View key={proj.id} style={styles.entry}>
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Text>
                        <Text style={styles.projectName}>{proj.name}</Text>
                        {proj.technologies.length > 0 && (
                          <Text> | {proj.technologies.join(', ')}</Text>
                        )}
                      </Text>
                    </View>
                    <Text style={[styles.rowRight, styles.dates]}>
                      {formatDateRange(proj.startDate, proj.endDate)}
                    </Text>
                  </View>
                  <View style={styles.bullets}>
                    {selected.map((bullet) => (
                      <View key={bullet.id} style={styles.bulletRow}>
                        <Text style={styles.bulletBullet}>•</Text>
                        <Text style={styles.bullet}>{bullet.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Technical Skills */}
        {resume.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <View>
              {resume.skills.map((skill) => (
                <View key={skill.category} style={styles.skillRow}>
                  <Text>
                    <Text style={styles.skillCategory}>{skill.category}:</Text>
                    <Text style={styles.skillItems}> {skill.items.join(', ')}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
