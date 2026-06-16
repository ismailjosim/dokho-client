'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authTokenStorage, graphqlRequest } from '@/services/graphql/client';

const VERIFY_OTP = /* GraphQL */ `
  mutation VerifyOtp($phone: String!, $otp: String!) {
    verifyOtp(phone: $phone, otp: $otp) {
      accessToken
      user {
        id
        name
        role
      }
    }
  }
`;

export default function VerifyOtpPage() {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(event.currentTarget);

    try {
      const result = await graphqlRequest<{
        verifyOtp: { accessToken: string; user: { name: string; role: string } };
      }>(VERIFY_OTP, {
        phone: String(formData.get('phone') || ''),
        otp: String(formData.get('otp') || ''),
      });

      authTokenStorage.set(result.verifyOtp.accessToken);
      setStatus(`${result.verifyOtp.user.name} হিসেবে লগইন সম্পন্ন হয়েছে।`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'OTP যাচাই ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <Button variant="ghost" asChild className="mb-6 w-fit px-0">
        <Link href="/register">
          <ArrowLeft />
          রেজিস্ট্রেশনে ফিরুন
        </Link>
      </Button>
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <KeyRound className="size-5 text-primary" />
          <h1 className="text-2xl font-bold">OTP যাচাই</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="phone">ফোন নম্বর</Label>
            <Input id="phone" name="phone" required placeholder="01XXXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input id="otp" name="otp" required maxLength={6} minLength={6} placeholder="123456" />
          </div>
          <Button className="w-full" disabled={isSubmitting}>
            যাচাই করুন
          </Button>
        </form>
        {status ? <p className="mt-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}
      </div>
    </main>
  );
}
