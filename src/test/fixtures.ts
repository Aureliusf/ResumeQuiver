import { sampleResume } from '@/data/sample-resume';
import type { Resume } from '@/types/resume';

export function cloneResume(resume: Resume = sampleResume): Resume {
  return JSON.parse(JSON.stringify(resume)) as Resume;
}
