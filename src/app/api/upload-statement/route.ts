import { NextRequest, NextResponse } from 'next/server';
import { parsePDF, cleanPDFText, extractTransactionSections } from '@/lib/pdf-parser';
import { extractTransactionsFromPDF } from '@/lib/openai';
import { db } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF
    const pdfData = await parsePDF(buffer);
    const cleanedText = cleanPDFText(pdfData.text);
    
    // Extract transaction sections
    const transactionSections = extractTransactionSections(cleanedText);
    
    if (transactionSections.length === 0) {
      return NextResponse.json(
        { error: 'No transaction data found in PDF' },
        { status: 400 }
      );
    }

    // Use OpenAI to extract transactions
    const aiResponse = await extractTransactionsFromPDF(cleanedText);
    
    if (!aiResponse.transactions || aiResponse.transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions could be extracted from PDF' },
        { status: 400 }
      );
    }

    // Store transactions in database
    const transactionPromises = aiResponse.transactions.map(transaction => 
      db.createTransaction({
        user_id: user.id,
        date: transaction.date,
        merchant: transaction.merchant,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        confidence_score: transaction.confidence_score,
        is_verified: false,
        source: 'manual',
      })
    );

    await Promise.all(transactionPromises);

    return NextResponse.json({
      success: true,
      transaction_count: aiResponse.transactions.length,
      message: `Successfully processed ${aiResponse.transactions.length} transactions`,
      processing_notes: aiResponse.processing_notes,
    });
  } catch (error) {
    console.error('Error processing PDF upload:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
