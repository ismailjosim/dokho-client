'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserRoundPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { graphqlRequest } from '@/services/graphql/client';

const CREATE_USER = /* GraphQL */ `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      phone
      role
    }
  }
`;

const REQUEST_OTP = /* GraphQL */ `
  mutation RequestOtp($phone: String!) {
    requestOtp(phone: $phone) {
      phone
      developmentOtp
      expiresInSeconds
    }
  }
`;

export default function RegisterPage() {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(event.currentTarget);
    const phone = String(formData.get('phone') || '');

    try {
      await graphqlRequest(CREATE_USER, {
        input: {
          name: String(formData.get('name') || ''),
          phone,
          role: String(formData.get('role') || 'CLIENT'),
        },
      });
      const otp = await graphqlRequest<{
        requestOtp: { developmentOtp: string | null };
      }>(REQUEST_OTP, { phone });
      setStatus(
        `রেজিস্ট্রেশন সম্পন্ন। OTP পেজে যান। ${
          otp.requestOtp.developmentOtp ? `ডেভেলপমেন্ট OTP: ${otp.requestOtp.developmentOtp}` : ''
        }`
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'Phone number already exists') {
        try {
          const otp = await graphqlRequest<{
            requestOtp: { developmentOtp: string | null };
          }>(REQUEST_OTP, { phone });
          setStatus(
            `এই ফোন নম্বর দিয়ে আগে অ্যাকাউন্ট তৈরি হয়েছে। OTP পেজে গিয়ে যাচাই করুন। ${
              otp.requestOtp.developmentOtp
                ? `ডেভেলপমেন্ট OTP: ${otp.requestOtp.developmentOtp}`
                : ''
            }`
          );
          return;
        } catch {
          setStatus('এই ফোন নম্বর দিয়ে আগে অ্যাকাউন্ট তৈরি হয়েছে। OTP পেজে গিয়ে যাচাই করুন।');
          return;
        }
      }

      setStatus(error instanceof Error ? error.message : 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <Button variant="ghost" asChild className="mb-6 w-fit px-0">
        <Link href="/">
          <ArrowLeft />
          হোমে ফিরুন
        </Link>
      </Button>
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <UserRoundPlus className="size-5 text-primary" />
          <h1 className="text-2xl font-bold">নতুন অ্যাকাউন্ট</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">নাম</Label>
            <Input id="name" name="name" required minLength={2} placeholder="আপনার নাম" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">ফোন নম্বর</Label>
            <Input id="phone" name="phone" required placeholder="01XXXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">অ্যাকাউন্ট টাইপ</Label>
            <select
              id="role"
              name="role"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue="CLIENT"
            >
              <option value="CLIENT">ক্লায়েন্ট</option>
              <option value="WORKER">কর্মী</option>
            </select>
          </div>
          <Button className="w-full" disabled={isSubmitting}>
            OTP পাঠান
          </Button>
        </form>
        {status ? <p className="mt-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}
        <Button variant="link" asChild className="mt-3 px-0">
          <Link href="/verify-otp">OTP আছে? যাচাই করুন</Link>
        </Button>
      </div>
    </main>
  );
}
