import { useState, useEffect, useCallback } from 'react'
import YAML from 'yaml'
import './App.css'

// Sample resume data structure
const SAMPLE_RESUME = {
  basics: {
    name: "Aurelio Fernandez",
    email: "aure@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "aurelius.dev",
    linkedin: "linkedin.com/in/aureliof",
    github: "github.com/aureliusf",
    summary: "Full-stack engineer with 8+ years building scalable systems. Passionate about developer experience, clean architecture, and shipping products that users love."
  },
  experience: [
    {
      company: "TechCorp",
      role: "Senior Software Engineer",
      dates: "2021 - Present",
      bullet_library: [
        { id: "scale", text: "Architected and deployed microservices handling 10M+ daily requests", tags: ["backend", "scale", "microservices"] },
        { id: "leadership", text: "Led team of 5 engineers through platform migration", tags: ["leadership", "management", "migration"] },
        { id: "performance", text: "Reduced API latency by 60% through caching and query optimization", tags: ["performance", "optimization"] },
        { id: "mentorship", text: "Mentored 3 junior engineers to senior level", tags: ["mentorship", "growth"] },
        { id: "cost", text: "Cut infrastructure costs by 40% via spot instances and right-sizing", tags: ["cost", "infrastructure"] }
      ]
    },
    {
      company: "StartupXYZ",
      role: "Full-Stack Developer",
      dates: "2018 - 2021",
      bullet_library: [
        { id: "mvp", text: "Built MVP from scratch, reaching 100K users in 6 months", tags: ["startup", "mvp", "growth"] },
        { id: "react", text: "Developed React component library used across 12 products", tags: ["frontend", "react", "design-system"] },
        { id: "api", text: "Designed RESTful APIs serving mobile and web clients", tags: ["api", "backend"] },
        { id: "agile", text: "Spearheaded agile transformation, reducing cycle time by 50%", tags: ["agile", "process"] }
      ]
    },
    {
      company: "AgencyPro",
      role: "Web Developer",
      dates: "2016 - 2018",
      bullet_library: [
        { id: "clients", text: "Delivered 20+ projects for Fortune 500 clients", tags: ["client-work", "delivery"] },
        { id: "wordpress", text: "Created custom WordPress themes and plugins", tags: ["wordpress", "php"] },
        { id: "responsive", text: "Implemented responsive designs for mobile-first experiences", tags: ["frontend", "responsive"] }
      ]
    }
  ],
  skills: [
    { category: "Languages", items: ["Python", "JavaScript", "TypeScript", "Go", "SQL"] },
    { category: "Frontend", items: ["React", "Vue", "HTML/CSS", "Tailwind"] },
    { category: "Backend", items: ["Node.js", "Django", "FastAPI", "PostgreSQL"] },
    { category: "DevOps", items: ["Docker", "Kubernetes", "AWS", "Terraform"] }
  ],
  education: [
    {
      school: "University of California, Berkeley",
      degree: "B.S. Computer Science",
      dates: "2012 - 2016"
    }
  ]
}

function App() {
  const [resume, setResume] = useState(SAMPLE_RESUME)
  const [yamlText, setYamlText] = useState('')
  const [activeTab, setActiveTab] = useState('editor')
  const [selectedBullets, setSelectedBullets] = useState({})
  const [jobDescription, setJobDescription] = useState('')
  const [isTailoring, setIsTailoring] = useState(false)
  const [showPrintView, setShowPrintView] = useState(false)

  // Initialize YAML text from resume
  useEffect(() => {
    setYamlText(YAML.stringify(resume))
    
    // Initialize selected bullets (first 3 per role by default)
    const initial = {}
    resume.experience.forEach((exp, idx) => {
      initial[idx] = exp.bullet_library.slice(0, 3).map(b => b.id)
    })
    setSelectedBullets(initial)
  }, [])

  const handleYamlChange = useCallback((text) => {
    setYamlText(text)
    try {
      const parsed = YAML.parse(text)
      setResume(parsed)
    } catch (e) {
      // Invalid YAML, don't update resume
    }
  }, [])

  const handleBulletToggle = (expIdx, bulletId) => {
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
      const tailored = {}
      
      resume.experience.forEach((exp, expIdx) => {
        const scored = exp.bullet_library.map(bullet => {
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
        scored.sort((a, b) => b.score - a.score)
        tailored[expIdx] = scored.slice(0, 3).map(b => b.id)
      })
      
      setSelectedBullets(tailored)
      setIsTailoring(false)
    }, 1500)
  }

  const getSelectedBulletsForRole = (expIdx) => {
    const exp = resume.experience[expIdx]
    const selectedIds = selectedBullets[expIdx] || []
    return exp.bullet_library.filter(b => selectedIds.includes(b.id))
  }

  if (showPrintView) {
    return (
      <div className="print-view">
        <button className="back-btn" onClick={() => setShowPrintView(false)}>
          ← Back to Editor
        </button>
        <div className="resume-page">
          <header className="resume-header">
            <h1>{resume.basics.name}</h1>
            <div className="contact-info">
              {resume.basics.email} • {resume.basics.phone} • {resume.basics.location}
              {resume.basics.website && ` • ${resume.basics.website}`}
            </div>
          </header>
          
          <section className="resume-section">
            <p className="summary">{resume.basics.summary}</p>
          </section>

          <section className="resume-section">
            <h2>Experience</h2>
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="experience-item">
                <div className="exp-header">
                  <div>
                    <strong>{exp.role}</strong> at {exp.company}
                  </div>
                  <span className="dates">{exp.dates}</span>
                </div>
                <ul>
                  {getSelectedBulletsForRole(idx).map((bullet, bidx) => (
                    <li key={bidx}>{bullet.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="resume-section">
            <h2>Skills</h2>
            <div className="skills-grid">
              {resume.skills.map((skill, idx) => (
                <div key={idx} className="skill-category">
                  <strong>{skill.category}:</strong> {skill.items.join(', ')}
                </div>
              ))}
            </div>
          </section>

          <section className="resume-section">
            <h2>Education</h2>
            {resume.education.map((edu, idx) => (
              <div