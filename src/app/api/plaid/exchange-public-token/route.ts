import { NextRequest, NextResponse } from 'next/server';
import { exchangePublicToken, getAccounts, getInstitution } from '@/lib/plaid';
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

    const { public_token, institution_id, institution_name } = await request.json();

    if (!public_token || !institution_id || !institution_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await exchangePublicToken(public_token);
    const accessToken = exchangeResponse.access_token;
    const itemId = exchangeResponse.item_id;

    // Get institution information
    const institution = await getInstitution(institution_id);

    // Store connected account
    const connectedAccount = await db.createConnectedAccount({
      user_id: user.id,
      plaid_access_token: accessToken,
      plaid_item_id: itemId,
      institution_name: institution_name,
      account_type: 'checking', // Default, could be enhanced
      status: 'active',
    });

    // Get accounts and sync initial transactions
    const accounts = await getAccounts(accessToken);
    
    // Sync transactions for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // This would typically be done in a background job
    // For now, we'll just return success
    // TODO: Implement transaction sync

    return NextResponse.json({
      success: true,
      account: connectedAccount,
      institution: institution.institution,
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return NextResponse.json(
      { error: 'Failed to connect bank account' },
      { status: 500 }
    );
  }
}
