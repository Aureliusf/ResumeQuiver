import { beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadPDF, generatePDF, getPDFFilename } from '@/lib/pdf-export';
import { sampleResume } from '@/data/sample-resume';

const { pdfMock, pdfDocumentMock, toBlobMock } = vi.hoisted(() => ({
  pdfMock: vi.fn(),
  pdfDocumentMock: vi.fn(),
  toBlobMock: vi.fn(),
}));

vi.mock('@react-pdf/renderer', () => ({
  pdf: pdfMock,
}));

vi.mock('@/components/preview/pdf-document', () => ({
  PDFDocument: pdfDocumentMock,
}));

describe('pdf-export', () => {
  beforeEach(() => {
    pdfMock.mockReset();
    pdfDocumentMock.mockReset();
    toBlobMock.mockReset();
  });

  it('generates a PDF blob from the rendered document tree', async () => {
    const blob = new Blob(['pdf']);
    const selectedBullets = new Map<string, string[]>([['exp-001', ['b-001']]]);
    const documentNode = { type: 'pdf-document' };

    pdfDocumentMock.mockReturnValue(documentNode);
    toBlobMock.mockResolvedValue(blob);
    pdfMock.mockReturnValue({ toBlob: toBlobMock });

    await expect(generatePDF(sampleResume, selectedBullets)).resolves.toBe(blob);
    expect(pdfDocumentMock).toHaveBeenCalledWith({ resume: sampleResume, selectedBullets });
    expect(pdfMock).toHaveBeenCalledWith(documentNode);
  });

  it('downloads a blob using a temporary link and revokes the object URL', () => {
    const blob = new Blob(['pdf']);
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:resume');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const appendChild = vi.spyOn(document.body, 'appendChild');
    const removeChild = vi.spyOn(document.body, 'removeChild');
    const anchor = document.createElement('a');
    const click = vi.spyOn(anchor, 'click').mockImplementation(() => {});
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    downloadPDF(blob, 'resume.pdf');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(createElement).toHaveBeenCalledWith('a');
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalledTimes(1);
    expect(removeChild).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:resume');
  });

  it('builds safe PDF filenames from resume names', () => {
    const resume = {
      ...sampleResume,
      basics: {
        ...sampleResume.basics,
        name: ' Jane Q. Engineer / Staff ',
      },
    };

    expect(getPDFFilename(resume)).toBe('jane-q-engineer-staff-resume.pdf');
  });
});
