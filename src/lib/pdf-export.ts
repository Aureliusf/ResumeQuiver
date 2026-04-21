import { pdf } from '@react-pdf/renderer';
import { PDFDocument } from '@/components/preview/pdf-document';
import type { Resume } from '@/types/resume';

export async function generatePDF(
  resume: Resume,
  selectedBullets: Map<string, string[]>
): Promise<Blob> {
  const document = PDFDocument({ resume, selectedBullets });
  const blob = await pdf(document).toBlob();
  return blob;
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getPDFFilename(resume: Resume): string {
  const name = resume.basics.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${name}-resume.pdf`;
}
