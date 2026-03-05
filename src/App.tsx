import { useState, useEffect, useCallback } from 'react'
import YAML from 'yaml'
import type { Resume } from '@/types/resume'
import { sampleResume } from '@/data/sample-resume'

// Initialize YAML text from resume
const getInitialYaml = (resume: Resume) => YAML.stringify(resume)

function App() {
  const [resume, setResume] = useState<Resume>(sampleResume)
  const [yamlText, setYamlText] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [selectedBullets, setSelectedBullets] = useState<Record<number, string[]>>({})
  const [jobDescription, setJobDescription] = useState<string>('')
  const [isTailoring, setIsTailoring] = useState<boolean>(false)
  const [showPrintView, setShowPrintView] = useState<boolean>(false)

  // Initialize YAML text from resume
  useEffect(() => {
    setYamlText(getInitialYaml(resume))
    
    // Initialize selected bullets (first 3 per role by default)
    const initial: Record<number, string[]> = {}
    resume.experience.forEach((exp, idx) => {
      initial[idx] = exp.bullets.slice(0, 3).map(b => b.id)
    })
    setSelectedBullets(initial)
  }, [])

  const handleYamlChange = useCallback((text: string) => {
    setYamlText(text)
    try {
      const parsed = YAML.parse(text) as Resume
      setResume(parsed)
    } catch {
      // Invalid YAML, don't update resume
    }
  }, [])

  const handleBulletToggle = (expIdx: number, bulletId: string) => {
    setSelectedBullets(prev => {
      const current = prev[expIdx] || []
      const updated = current.includes(bulletId)
        ? current.filter(id => id !== bulletId)
        : [...current, bulletId]
      return { ...prev, [expIdx]: updated }
    })
  }

  const simulateAITailoring = () => {
    setIsTailoring(true)
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const keywords = jobDescription.toLowerCase()
      const tailored: Record<number, string[]> = {}
      
      resume.experience.forEach((exp, expIdx) => {
        const scored = exp.bullets.map(bullet => {
          const bulletText = bullet.text.toLowerCase()
          const tags = bullet.tags.join(' ').toLowerCase()
          
          // Simple keyword matching (in real app, this would be an API call)
          let score = 0
          const words = keywords.split(/\s+/)
          words.forEach(word => {
            if (word.length > 3) {
              if (bulletText.includes(word)) score += 2
              if (tags.includes(word)) score += 3
            }
          })
          
          return { ...bullet, score }
        })
        
        // Sort by score and take top 3
        scored.sort((a, b) => (b.score || 0) - (a.score || 0))
        tailored[expIdx] = scored.slice(0, 3).map(b => b.id)
      })
      
      setSelectedBullets(tailored)
      setIsTailoring(false)
    }, 1500)
  }

  const getSelectedBulletsForRole = (expIdx: number) => {
    const exp = resume.experience[expIdx]
    const selectedIds = selectedBullets[expIdx] || []
    return exp.bullets.filter(b => selectedIds.includes(b.id))
  }

  if (showPrintView) {
    return (
      <div className="print-view p-8 bg-df-text text-df-primary min-h-screen">
        <button 
          className="back-btn mb-4 px-4 py-2 bg-df-primary text-df-text rounded hover:bg-df-surface transition-colors" 
          onClick={() => setShowPrintView(false)}
        >
          ← Back to Editor
        </button>
        <div className="resume-page max-w-4xl mx-auto bg-df-text p-8 shadow-lg">
          <header className="resume-header mb-6 border-b border-gray-300 pb-4">
            <h1 className="text-3xl font-bold">{resume.basics.name}</h1>
            <div className="contact-info text-sm mt-2 text-gray-600">
              {resume.basics.email} • {resume.basics.phone} • {resume.basics.location}
              {resume.basics.website && ` • ${resume.basics.website}`}
            </div>
          </header>
          
          <section className="resume-section mb-6">
            <p className="summary text-gray-700">{resume.basics.summary}</p>
          </section>

          <section className="resume-section mb-6">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-3">Experience</h2>
            {resume.experience.map((exp, idx) => (
              <div key={exp.id} className="experience-item mb-4">
                <div className="exp-header flex justify-between items-baseline mb-1">
                  <div>
                    <strong>{exp.role}</strong> at {exp.company}
                  </div>
                  <span className="dates text-gray-600 text-sm">{exp.startDate} - {exp.endDate}</span>
                </div>
                <ul className="list-disc list-inside text-gray-700">
                  {getSelectedBulletsForRole(idx).map(bullet => (
                    <li key={bullet.id}>{bullet.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="resume-section mb-6">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-3">Skills</h2>
            <div className="skills-grid">
              {resume.skills.map((skill) => (
                <div key={skill.category} className="skill-category mb-2">
                  <strong>{skill.category}:</strong> {skill.items.join(', ')}
                </div>
              ))}
            </div>
          </section>

          <section className="resume-section">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-3">Education</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="education-item mb-2">
                <div className="flex justify-between">
                  <strong>{edu.school}</strong>
                  <span className="text-gray-600 text-sm">{edu.dates}</span>
                </div>
                <div>{edu.degree}</div>
              </div>
            ))}
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-df-primary text-df-text">
      <header className="bg-df-surface border-b border-df-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bebas tracking-wider text-gradient">
            Resume Builder
          </h1>
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded font-space transition-colors ${
                activeTab === 'editor' 
                  ? 'bg-df-accent-red text-df-text' 
                  : 'bg-df-elevated hover:bg-df-accent-cyan/20'
              }`}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </button>
            <button
              className={`px-4 py-2 rounded font-space transition-colors ${
                activeTab === 'preview' 
                  ? 'bg-df-accent-red text-df-text' 
                  : 'bg-df-elevated hover:bg-df-accent-cyan/20'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
            <button
              className="px-4 py-2 rounded font-space bg-df-accent-cyan text-df-primary hover:bg-df-accent-cyan/80 transition-colors"
              onClick={() => setShowPrintView(true)}
            >
              Print
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left panel - YAML Editor */}
            <div className="space-y-4">
              <div className="bg-df-surface rounded-lg p-4 border border-df-border">
                <h2 className="text-lg font-space font-semibold mb-3">AI Tailoring</h2>
                <textarea
                  className="w-full h-32 p-3 bg-df-elevated border border-df-border rounded font-mono text-sm resize-none focus:outline-none focus:border-df-accent-cyan"
                  placeholder="Paste job description here to get AI-powered bullet recommendations..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <button
                  className="mt-3 w-full py-2 bg-df-accent-red rounded font-space font-medium hover:bg-df-accent-red/80 transition-colors disabled:opacity-50"
                  onClick={simulateAITailoring}
                  disabled={isTailoring || !jobDescription.trim()}
                >
                  {isTailoring ? 'Analyzing...' : 'Generate Tailored Bullets'}
                </button>
              </div>

              <div className="bg-df-surface rounded-lg border border-df-border overflow-hidden">
                <div className="px-4 py-2 bg-df-elevated border-b border-df-border">
                  <h2 className="text-lg font-space font-semibold">YAML Editor</h2>
                </div>
                <textarea
                  className="w-full h-[500px] p-4 bg-df-primary font-mono text-sm resize-none focus:outline-none"
                  value={yamlText}
                  onChange={(e) => handleYamlChange(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Right panel - Bullet Selection */}
            <div className="bg-df-surface rounded-lg border border-df-border overflow-hidden">
              <div className="px-4 py-3 bg-df-elevated border-b border-df-border">
                <h2 className="text-lg font-space font-semibold">Bullet Library</h2>
                <p className="text-sm text-df-text-secondary">
                  Select bullets to include in your resume
                </p>
              </div>
              <div className="p-4 space-y-4">
                {resume.experience.map((exp, expIdx) => (
                  <div key={exp.id} className="border border-df-border rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-space font-semibold text-df-accent-cyan">
                        {exp.role} @ {exp.company}
                      </h3>
                      <span className="text-xs text-df-text-secondary font-mono">
                        {exp.bullets.filter(b => selectedBullets[expIdx]?.includes(b.id)).length} selected
                      </span>
                    </div>
                    <div className="space-y-2">
                      {exp.bullets.map((bullet) => (
                        <label
                          key={bullet.id}
                          className="flex items-start gap-3 p-2 rounded hover:bg-df-elevated cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 accent-df-accent-red"
                            checked={selectedBullets[expIdx]?.includes(bullet.id) || false}
                            onChange={() => handleBulletToggle(expIdx, bullet.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm">{bullet.text}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {bullet.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 bg-df-primary text-df-text-secondary rounded font-mono"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="bg-df-text text-df-primary p-8 max-w-4xl mx-auto shadow-lg">
            <header className="mb-6 border-b-2 border-df-primary pb-4">
              <h1 className="text-4xl font-bebas">{resume.basics.name}</h1>
              <div className="mt-2 text-sm text-gray-600 font-space">
                {resume.basics.email} • {resume.basics.phone} • {resume.basics.location}
                {resume.basics.website && ` • ${resume.basics.website}`}
              </div>
            </header>
            
            <section className="mb-6">
              <p className="text-gray-700 leading-relaxed">{resume.basics.summary}</p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-bebas border-b border-gray-400 mb-3">Experience</h2>
              {resume.experience.map((exp) => (
                <div key={exp.id} className="mb-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <span className="font-semibold">{exp.role}</span> — {exp.company}
                    </div>
                    <span className="text-sm text-gray-600 font-mono">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {exp.bullets.filter(b => selectedBullets[resume.experience.indexOf(exp)]?.includes(b.id)).map((bullet) => (
                      <li key={bullet.id}>{bullet.text}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-bebas border-b border-gray-400 mb-3">Projects</h2>
              {resume.projects.map((proj) => (
                <div key={proj.id} className="mb-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <span className="font-semibold">{proj.name}</span>
                      {proj.url && (
                        <span className="text-sm text-gray-600 ml-2">{proj.url}</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 font-mono">
                      {proj.startDate} - {proj.endDate}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {proj.technologies.join(', ')}
                  </div>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {proj.bullets.slice(0, 2).map((bullet) => (
                      <li key={bullet.id}>{bullet.text}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-bebas border-b border-gray-400 mb-3">Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {resume.skills.map((skill) => (
                  <div key={skill.category} className="text-gray-700">
                    <span className="font-semibold">{skill.category}:</span>{' '}
                    {skill.items.join(', ')}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bebas border-b border-gray-400 mb-3">Education</h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">{edu.school}</span>
                    <span className="text-sm text-gray-600 font-mono">{edu.dates}</span>
                  </div>
                  <div className="text-gray-700">{edu.degree}</div>
                </div>
              ))}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
