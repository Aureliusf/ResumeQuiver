import { z } from 'zod';

// Bullet schema
export const bulletSchema = z.object({
  id: z.string(),
  text: z.string(),
  tags: z.array(z.string()),
  selected: z.boolean().optional(),
  aiGenerated: z.boolean().optional(),
});

// Education schema
export const educationSchema = z.object({
  id: z.string(),
  school: z.string(),
  location: z.string(),
  degree: z.string(),
  dates: z.string(),
});

// Experience schema
export const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  location: z.string(),
  bullets: z.array(bulletSchema),
  startDate: z.string(),
  endDate: z.string(),
});

// Project schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  technologies: z.array(z.string()),
  bullets: z.array(bulletSchema),
  startDate: z.string(),
  endDate: z.string(),
  url: z.string().optional(),
});

// Skill category schema
export const skillCategorySchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

// Basics schema
export const basicsSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  location: z.string(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  summary: z.string(),
});

// Resume schema
export const resumeSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().default(1),
  basics: basicsSchema,
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillCategorySchema),
});

// Resume metadata schema
export const resumeMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
});

// Resume list item schema
export const resumeListItemSchema = resumeMetadataSchema.extend({
  preview: z.string().optional(),
});

// Export inferred types
export type Bullet = z.infer<typeof bulletSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type Basics = z.infer<typeof basicsSchema>;
export type Resume = z.infer<typeof resumeSchema>;
export type ResumeMetadata = z.infer<typeof resumeMetadataSchema>;
export type ResumeListItem = z.infer<typeof resumeListItemSchema>;
