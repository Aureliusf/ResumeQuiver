import type { Resume } from '@/types/resume';

/**
 * Sample resume data based on Jake Gutierrez format
 * This provides a realistic example for new users
 */
export const sampleResume: Resume = {
  id: 'sample-resume-001',
  name: 'Jake Gutierrez - Software Engineer',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  version: 1,
  
  basics: {
    name: 'Jake Gutierrez',
    email: 'jake.gutierrez@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'jakeg.dev',
    linkedin: 'linkedin.com/in/jakegutierrez',
    github: 'github.com/jakegut',
    summary: 'Full-stack software engineer with 5+ years of experience building scalable web applications and distributed systems. Passionate about clean code, system design, and delivering exceptional user experiences. Proven track record of leading teams and shipping products that serve millions of users.',
  },
  
  education: [
    {
      id: 'edu-001',
      school: 'University of Texas at Austin',
      location: 'Austin, TX',
      degree: 'B.S. in Computer Science, Minor in Mathematics',
      dates: 'Aug. 2015 -- May 2019',
    },
    {
      id: 'edu-002',
      school: 'Georgia Institute of Technology',
      location: 'Atlanta, GA',
      degree: 'M.S. in Computer Science (Online)',
      dates: 'Jan. 2020 -- Dec. 2022',
    },
  ],
  
  experience: [
    {
      id: 'exp-001',
      company: 'Stripe',
      role: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: 'Present',
      bullets: [
        {
          id: 'b-001',
          text: 'Architected and implemented a new real-time fraud detection system processing 50,000+ transactions per second with 99.99% uptime',
          tags: ['backend', 'fraud-detection', 'real-time', 'scala'],
          selected: true,
        },
        {
          id: 'b-002',
          text: 'Led a team of 4 engineers to redesign the merchant onboarding flow, reducing time-to-first-transaction from 3 days to 15 minutes',
          tags: ['leadership', 'product', 'ux', 'typescript'],
          selected: true,
        },
        {
          id: 'b-003',
          text: 'Built a comprehensive testing framework that reduced flaky tests by 85% and improved CI/CD pipeline reliability',
          tags: ['testing', 'devops', 'ci-cd', 'ruby'],
          selected: true,
        },
        {
          id: 'b-004',
          text: 'Optimized database queries and caching strategies, reducing API latency by 40% for high-traffic endpoints',
          tags: ['performance', 'optimization', 'postgresql', 'redis'],
          selected: false,
        },
        {
          id: 'b-005',
          text: 'Mentored 3 junior engineers, conducting weekly code reviews and pair programming sessions to accelerate their growth',
          tags: ['mentorship', 'code-review', 'team-growth'],
          selected: false,
        },
      ],
    },
    {
      id: 'exp-002',
      company: 'Airbnb',
      role: 'Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2019-06',
      endDate: '2022-02',
      bullets: [
        {
          id: 'b-006',
          text: 'Developed core search and recommendation algorithms that increased booking conversion by 12% across mobile and web platforms',
          tags: ['machine-learning', 'search', 'recommendation', 'python'],
          selected: true,
        },
        {
          id: 'b-007',
          text: 'Shipped a dynamic pricing tool used by 50,000+ hosts, generating an estimated $200M in additional host revenue annually',
          tags: ['product', 'pricing', 'data-pipelines', 'spark'],
          selected: true,
        },
        {
          id: 'b-008',
          text: 'Refactored legacy React components to TypeScript, improving developer productivity and reducing runtime errors by 60%',
          tags: ['frontend', 'typescript', 'react', 'refactoring'],
          selected: true,
        },
        {
          id: 'b-009',
          text: 'Collaborated with design and product teams to launch the Experiences marketplace, reaching $1B in bookings within first year',
          tags: ['collaboration', 'marketplace', 'growth'],
          selected: false,
        },
      ],
    },
    {
      id: 'exp-003',
      company: 'TechCorp',
      role: 'Software Engineering Intern',
      location: 'Austin, TX',
      startDate: '2018-05',
      endDate: '2018-08',
      bullets: [
        {
          id: 'b-010',
          text: 'Built an internal dashboard for monitoring microservices health, used daily by 100+ engineers across the organization',
          tags: ['internship', 'dashboard', 'monitoring', 'vue-js'],
          selected: true,
        },
        {
          id: 'b-011',
          text: 'Implemented automated alerting system that reduced mean-time-to-detection for critical incidents from 15 minutes to 30 seconds',
          tags: ['devops', 'alerting', 'incident-response', 'go'],
          selected: false,
        },
        {
          id: 'b-012',
          text: 'Developed RESTful APIs for internal tooling using Go, serving 10,000+ requests per day with 99.9% uptime',
          tags: ['api', 'backend', 'go', 'performance'],
          selected: false,
        },
        {
          id: 'b-013',
          text: 'Created comprehensive documentation and onboarding guide for new interns, reducing ramp-up time by 50%',
          tags: ['documentation', 'onboarding', 'internship'],
          selected: false,
        },
      ],
    },
  ],
  
  projects: [
    {
      id: 'proj-001',
      name: 'Resume Builder Pro',
      technologies: ['TypeScript', 'React', 'Tailwind CSS', 'Zod', 'Vite'],
      startDate: '2023-11',
      endDate: '2024-01',
      url: 'https://github.com/jakegut/resume-builder',
      bullets: [
        {
          id: 'pb-001',
          text: 'Open-source resume builder with AI-powered bullet point optimization and real-time preview',
          tags: ['open-source', 'ai', 'resume'],
          selected: true,
        },
        {
          id: 'pb-002',
          text: 'Implemented custom YAML parser with validation using Zod schemas for type-safe data handling',
          tags: ['parsing', 'validation', 'type-safety'],
          selected: true,
        },
        {
          id: 'pb-003',
          text: 'Achieved 95+ Lighthouse score with optimized bundle size and lazy loading strategies',
          tags: ['performance', 'optimization', 'lighthouse'],
          selected: false,
        },
      ],
    },
    {
      id: 'proj-002',
      name: 'Distributed Task Queue',
      technologies: ['Rust', 'Tokio', 'Redis', 'gRPC'],
      startDate: '2023-06',
      endDate: '2023-09',
      url: 'https://github.com/jakegut/task-queue',
      bullets: [
        {
          id: 'pb-004',
          text: 'High-performance distributed task queue processing 100,000+ jobs per second with at-least-once delivery guarantees',
          tags: ['distributed-systems', 'performance', 'rust'],
          selected: true,
        },
        {
          id: 'pb-005',
          text: 'Implemented backpressure and rate limiting to prevent overload during traffic spikes',
          tags: ['backpressure', 'rate-limiting', 'reliability'],
          selected: true,
        },
      ],
    },
    {
      id: 'proj-003',
      name: 'ML Model Registry',
      technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes'],
      startDate: '2022-08',
      endDate: '2022-12',
      url: 'https://github.com/jakegut/ml-registry',
      bullets: [
        {
          id: 'pb-006',
          text: 'Internal tool for versioning and deploying ML models with A/B testing and rollback capabilities',
          tags: ['mlops', 'versioning', 'deployment'],
          selected: true,
        },
        {
          id: 'pb-007',
          text: 'Integrated with existing CI/CD pipeline to enable automated model deployment on merge',
          tags: ['ci-cd', 'automation', 'integration'],
          selected: false,
        },
      ],
    },
  ],
  
  skills: [
    {
      category: 'Languages',
      items: ['TypeScript', 'Python', 'Go', 'Rust', 'Ruby', 'SQL'],
    },
    {
      category: 'Frontend',
      items: ['React', 'Vue.js', 'Next.js', 'Tailwind CSS', 'WebAssembly'],
    },
    {
      category: 'Backend',
      items: ['Node.js', 'FastAPI', 'Django', 'gRPC', 'GraphQL', 'REST APIs'],
    },
    {
      category: 'Data',
      items: ['PostgreSQL', 'Redis', 'Elasticsearch', 'Apache Kafka', 'Spark'],
    },
    {
      category: 'Cloud & DevOps',
      items: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'GitHub Actions'],
    },
    {
      category: 'Tools',
      items: ['Git', 'Linux', 'Vim', 'DataDog', 'Grafana', 'Prometheus'],
    },
  ],
};

/**
 * Create a new empty resume with default values
 */
export function createEmptyResume(): Resume {
  const now = new Date().toISOString();
  return {
    id: `resume-${Date.now()}`,
    name: 'Untitled Resume',
    createdAt: now,
    updatedAt: now,
    version: 1,
    basics: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
  };
}

export default sampleResume;
