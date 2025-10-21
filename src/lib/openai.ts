import OpenAI from 'openai';
import { OpenAITransaction, OpenAIPDFResponse } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Extract transactions from PDF text
export async function extractTransactionsFromPDF(pdfText: string): Promise<OpenAIPDFResponse> {
  const prompt = `
You are a financial data extraction expert. Extract transaction data from the following bank statement text.

Extract ALL transactions and return them in a structured JSON format. For each transaction, provide:
- date: YYYY-MM-DD format
- merchant: Clean merchant name (remove extra characters, standardize)
- amount: Number (positive for credits, negative for debits)
- description: Original description from statement
- category: One of: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Subscriptions, Other
- confidence_score: 0-1 confidence in the extraction

Return ONLY valid JSON in this exact format:
{
  "transactions": [
    {
      "date": "2024-01-15",
      "merchant": "STARBUCKS",
      "amount": -5.50,
      "description": "STARBUCKS #1234 TORONTO ON",
      "category": "Food & Dining",
      "confidence_score": 0.95
    }
  ],
  "total_count": 1,
  "processing_notes": "Successfully extracted 1 transaction"
}

Bank statement text:
${pdfText}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a financial data extraction expert. Extract transaction data accurately and return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content) as OpenAIPDFResponse;
  } catch (error) {
    console.error('Error extracting transactions from PDF:', error);
    throw new Error('Failed to extract transactions from PDF');
  }
}

// Categorize a transaction
export async function categorizeTransaction(
  merchant: string,
  description: string,
  amount: number
): Promise<{ category: string; confidence_score: number }> {
  const prompt = `
Categorize this financial transaction:

Merchant: ${merchant}
Description: ${description}
Amount: $${amount}

Choose the most appropriate category from:
- Food & Dining (restaurants, cafes, grocery stores, food delivery)
- Transportation (gas, public transit, rideshare, parking, car maintenance)
- Shopping (retail stores, online shopping, clothing, electronics)
- Entertainment (movies, games, streaming services, events)
- Bills & Utilities (electricity, water, internet, phone, rent)
- Healthcare (medical expenses, pharmacy, doctor visits)
- Education (tuition, books, courses, school supplies)
- Travel (hotels, flights, vacation expenses)
- Subscriptions (monthly/yearly recurring services)
- Other (anything that doesn't fit above categories)

Return JSON in this format:
{
  "category": "Food & Dining",
  "confidence_score": 0.95
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a financial categorization expert. Categorize transactions accurately based on merchant and description.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content) as { category: string; confidence_score: number };
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    return { category: 'Other', confidence_score: 0.1 };
  }
}

// Detect subscriptions from transactions
export async function detectSubscriptions(transactions: Array<{
  merchant: string;
  amount: number;
  date: string;
  description: string;
}>): Promise<Array<{
  merchant: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  confidence: number;
}>> {
  const prompt = `
Analyze these transactions to identify recurring subscriptions:

${JSON.stringify(transactions, null, 2)}

Identify patterns that suggest recurring payments (same merchant, similar amounts, regular intervals).
Look for common subscription indicators like:
- Monthly/yearly recurring amounts
- Same merchant appearing multiple times
- Amounts that are typical for subscriptions (e.g., $9.99, $14.99, $29.99)
- Descriptions containing "subscription", "monthly", "annual", etc.

Return JSON array of detected subscriptions:
[
  {
    "merchant": "NETFLIX",
    "amount": 15.99,
    "frequency": "monthly",
    "confidence": 0.95
  }
]
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a subscription detection expert. Identify recurring payment patterns from transaction data.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const result = JSON.parse(content);
    return result.subscriptions || [];
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
    return [];
  }
}
