import pdf from 'pdf-parse';

export interface PDFParseResult {
  text: string;
  pages: number;
  info: any;
}

export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  try {
    const data = await pdf(buffer);
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

export function cleanPDFText(text: string): string {
  // Remove excessive whitespace and normalize line breaks
  let cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  // Remove common PDF artifacts
  cleaned = cleaned
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/Generated on:.*$/gm, '')
    .replace(/Statement Period:.*$/gm, '')
    .replace(/Account Number:.*$/gm, '')
    .replace(/^\s*[-=]+\s*$/gm, '') // Remove separator lines
    .replace(/^\s*\d+\s*$/gm, '') // Remove page numbers
    .trim();

  return cleaned;
}

export function extractTransactionSections(text: string): string[] {
  // Split text into sections that might contain transactions
  const sections = text.split(/\n\s*\n/);
  
  // Filter sections that look like transaction data
  const transactionSections = sections.filter(section => {
    const lines = section.split('\n');
    
    // Look for patterns that suggest transaction data
    const hasDatePattern = lines.some(line => 
      /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line) || 
      /\d{4}-\d{2}-\d{2}/.test(line)
    );
    
    const hasAmountPattern = lines.some(line => 
      /\$[\d,]+\.?\d*/.test(line) || 
      /[\d,]+\.?\d*\s*[+-]?/.test(line)
    );
    
    const hasMerchantPattern = lines.some(line => 
      /[A-Z][A-Z\s&]+/.test(line) && 
      !/STATEMENT|ACCOUNT|BALANCE|TOTAL/i.test(line)
    );
    
    return hasDatePattern && hasAmountPattern && hasMerchantPattern;
  });
  
  return transactionSections;
}
