type GraphQLResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string; extensions?: { issues?: Array<{ message: string }> } }>;
};

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:5000/graphql';

const errorMessages: Record<string, string> = {
  'Phone number must be a valid Bangladeshi mobile number':
    'বাংলাদেশি ১১ সংখ্যার ফোন নম্বর দিন। যেমন: 017XXXXXXXX',
  'Phone number already exists': 'এই ফোন নম্বর দিয়ে আগে অ্যাকাউন্ট তৈরি হয়েছে।',
  'No account found for this phone number': 'এই ফোন নম্বর দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।',
  'OTP must be 6 digits': 'OTP অবশ্যই ৬ সংখ্যার হতে হবে।',
  'Invalid OTP': 'OTP সঠিক নয়। আবার চেষ্টা করুন।',
  'OTP expired or not requested': 'OTP মেয়াদ শেষ হয়েছে অথবা আগে OTP পাঠানো হয়নি।',
  'Too many OTP attempts': 'অনেকবার ভুল OTP দেওয়া হয়েছে। নতুন OTP নিন।',
  'Too many OTP requests. Please try again later':
    'অল্প সময়ে বেশি OTP চাওয়া হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।',
  'Worker access required': 'এই কাজের জন্য কর্মী হিসেবে লগইন করুন।',
  'Admin access required': 'এই কাজের জন্য অ্যাডমিন হিসেবে লগইন করুন।',
  'Invalid admin credentials': 'অ্যাডমিন ফোন নম্বর বা পাসওয়ার্ড সঠিক নয়।',
  'Cloudinary credentials are not configured': 'Cloudinary সেটআপ করা নেই। .env ফাইল চেক করুন।',
  'Image must be a data URI': 'ছবির ফাইল সঠিক নয়। আবার আপলোড করুন।',
  'Payment credit required': 'যোগাযোগ নম্বর দেখতে আগে পেমেন্ট ক্রেডিট কিনুন।',
  'Login required': 'এই কাজের জন্য আগে লগইন করুন।',
  'Request validation failed': 'দেওয়া তথ্য ঠিক নেই। আবার দেখে জমা দিন।',
};

function normalizeErrorMessage(message: string) {
  return errorMessages[message] || message;
}

export async function graphqlRequest<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(query: string, variables?: TVariables, token?: string) {
  let response: Response;

  try {
    response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new Error('সার্ভারে সংযোগ করা যায়নি। ইন্টারনেট বা API সার্ভার চালু আছে কিনা দেখুন।');
  }

  let result: GraphQLResponse<TData>;

  try {
    result = (await response.json()) as GraphQLResponse<TData>;
  } catch {
    throw new Error('সার্ভার থেকে সঠিক উত্তর পাওয়া যায়নি।');
  }

  if (!response.ok || result.errors?.length) {
    const firstError = result.errors?.[0];
    const issueMessage = firstError?.extensions?.issues?.[0]?.message;
    throw new Error(normalizeErrorMessage(issueMessage || firstError?.message || 'অনুরোধ ব্যর্থ হয়েছে'));
  }

  if (!result.data) {
    throw new Error('সার্ভার থেকে কোনো তথ্য পাওয়া যায়নি।');
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
