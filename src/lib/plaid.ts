import { Configuration, PlaidApi, PlaidEnvironments, LinkTokenCreateRequest, TransactionsGetRequest } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Create link token for Canadian institutions
export async function createLinkToken(userId: string) {
  const request: LinkTokenCreateRequest = {
    user: {
      client_user_id: userId,
    },
    client_name: 'HabitCents',
    products: ['transactions'],
    country_codes: ['CA'], // Canada
    language: 'en',
    webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/plaid/webhook`,
  };

  try {
    const response = await plaidClient.linkTokenCreate(request);
    return response.data;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
}

// Exchange public token for access token
export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return response.data;
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
}

// Get transactions for an account
export async function getTransactions(accessToken: string, startDate: string, endDate: string) {
  const request: TransactionsGetRequest = {
    access_token: accessToken,
    start_date: new Date(startDate),
    end_date: new Date(endDate),
  };

  try {
    const response = await plaidClient.transactionsGet(request);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// Get account information
export async function getAccounts(accessToken: string) {
  try {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
}

// Get institution information
export async function getInstitution(institutionId: string) {
  try {
    const response = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ['CA'],
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching institution:', error);
    throw error;
  }
}
