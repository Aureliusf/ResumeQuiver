import YAML from 'yaml';
import { resumeSchema } from '@/schemas/resume-schema';
import type { Resume } from '@/types/resume';

interface YamlParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Parse YAML string with validation
 */
export function parseYaml(yamlString: string): YamlParseResult<Resume> {
  try {
    // First, try to parse the YAML
    const parsed = YAML.parse(yamlString);
    
    // Then validate against the schema
    const result = resumeSchema.safeParse(parsed);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      // Format Zod validation errors
      const errors = result.error.issues.map((issue) => 
        `${issue.path.map(String).join('.')}: ${issue.message}`
      ).join('; ');
      
      return {
        success: false,
        error: `Validation error: ${errors}`,
      };
    }
  } catch (error) {
    // Handle YAML parsing errors
    if (error instanceof Error) {
      return {
        success: false,
        error: `YAML parsing error: ${error.message}`,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while parsing YAML',
    };
  }
}

/**
 * Convert resume to YAML string
 */
export function stringifyYaml(resume: Resume): string {
  try {
    // Use YAML.stringify with options for better formatting
    return YAML.stringify(resume, null, {
      indent: 2,
      lineWidth: 0, // Don't wrap lines
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to convert to YAML: ${error.message}`);
    }
    throw new Error('Unknown error occurred while converting to YAML');
  }
}

/**
 * Parse YAML without strict validation (for partial/incomplete data)
 */
export function parseYamlLoose(yamlString: string): YamlParseResult<unknown> {
  try {
    const parsed = YAML.parse(yamlString);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `YAML parsing error: ${error.message}`,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while parsing YAML',
    };
  }
}

/**
 * Check if a string is valid YAML syntax
 */
export function isValidYamlSyntax(yamlString: string): boolean {
  try {
    YAML.parse(yamlString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is valid YAML and matches resume schema
 */
export function isValidResumeYaml(yamlString: string): boolean {
  const result = parseYaml(yamlString);
  return result.success;
}

/**
 * Get YAML errors for a string (useful for live validation)
 */
export function getYamlErrors(yamlString: string): string[] {
  const errors: string[] = [];
  
  // Check YAML syntax first
  try {
    YAML.parse(yamlString);
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
    }
    return errors;
  }
  
  // Then check schema validation
  const result = parseYaml(yamlString);
  if (!result.success && result.error) {
    errors.push(result.error);
  }
  
  return errors;
}

/**
 * Merge partial YAML data with default resume structure
 */
export function mergeWithDefaults(partialData: Partial<Resume>): Resume {
  const now = new Date().toISOString();
  
  return {
    id: partialData.id || `resume-${Date.now()}`,
    name: partialData.name || 'Untitled Resume',
    createdAt: partialData.createdAt || now,
    updatedAt: partialData.updatedAt || now,
    version: partialData.version || 1,
    basics: {
      name: partialData.basics?.name || '',
      email: partialData.basics?.email || '',
      phone: partialData.basics?.phone || '',
      location: partialData.basics?.location || '',
      summary: partialData.basics?.summary || '',
      ...(partialData.basics?.website && { website: partialData.basics.website }),
      ...(partialData.basics?.linkedin && { linkedin: partialData.basics.linkedin }),
      ...(partialData.basics?.github && { github: partialData.basics.github }),
    },
    education: partialData.education || [],
    experience: partialData.experience || [],
    projects: partialData.projects || [],
    skills: partialData.skills || [],
  };
}
