// Resume Builder Type Definitions
// Based on Jake's Resume format

export interface Bullet {
  id: string;
  text: string;
  tags?: string[];
  selected?: boolean;
  aiGenerated?: boolean;
}

export interface Education {
  id: string;
  school: string;
  location: string;
  degree: string;
  dates: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  bullets: Bullet[];
  startDate: string;
  endDate: string;
}

export interface Project {
  id: string;
  name: string;
  technologies: string[];
  bullets: Bullet[];
  startDate: string;
  endDate: string;
  url?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface Basics {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
}

export interface Resume {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  basics: Basics;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: SkillCategory[];
}

// Metadata for storage
export interface ResumeMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// For storing multiple resumes
export interface ResumeListItem extends ResumeMetadata {
  preview?: string;
}
