type GraphQLResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:5000/graphql';

export async function graphqlRequest<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(query: string, variables?: TVariables, token?: string) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = (await response.json()) as GraphQLResponse<TData>;

  if (!response.ok || result.errors?.length) {
    throw new Error(result.errors?.[0]?.message || 'Request failed');
  }

  if (!result.data) {
    throw new Error('No data returned from server');
  }

  return result.data;
}

export const authTokenStorage = {
  get() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('dokho_access_token');
  },
  set(token: string) {
    window.localStorage.setItem('dokho_access_token', token);
  },
  clear() {
    window.localStorage.removeItem('dokho_access_token');
  },
};
