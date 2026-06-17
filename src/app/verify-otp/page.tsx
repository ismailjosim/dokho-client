'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authTokenStorage, graphqlRequest } from '@/services/graphql/client';

const REQUEST_OTP = /* GraphQL */ `
  mutation RequestOtp($phone: String!) {
    requestOtp(phone: $phone) {
      phone
      developmentOtp
      expiresInSeconds
    }
  }
`;

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

function getInitialPhone() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('phone') || '';
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState(getInitialPhone);
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('');
  const [nextHref, setNextHref] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function getPhoneError() {
    if (!phone.trim()) return 'ফোন নম্বর দিন।';
    if (!/^01\d{9}$/.test(phone.trim())) return 'বাংলাদেশি ১১ সংখ্যার ফোন নম্বর দিন।';
    return '';
  }

  function getOtpError() {
    if (!otp.trim()) return 'OTP দিন।';
    if (!/^\d{6}$/.test(otp.trim())) return 'OTP অবশ্যই ৬ সংখ্যার হতে হবে।';
    return '';
  }

  async function handleSendOtp() {
    setIsSendingOtp(true);
    setStatus('');
    setNextHref('');
    const phoneError = getPhoneError();

    if (phoneError) {
      setStatus(phoneError);
      setIsSendingOtp(false);
      return;
    }

    try {
      const result = await graphqlRequest<{
        requestOtp: { developmentOtp: string | null; expiresInSeconds: number };
      }>(REQUEST_OTP, { phone: phone.trim() });

      setStatus(
        `OTP পাঠানো হয়েছে। ${
          result.requestOtp.developmentOtp
            ? `ডেভেলপমেন্ট OTP: ${result.requestOtp.developmentOtp}`
            : ''
        }`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'OTP পাঠানো যায়নি');
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');
    setNextHref('');
    const phoneError = getPhoneError();
    const otpError = getOtpError();

    if (phoneError || otpError) {
      setStatus(phoneError || otpError);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await graphqlRequest<{
        verifyOtp: { accessToken: string; user: { name: string; role: string } };
      }>(VERIFY_OTP, {
        phone: phone.trim(),
        otp: otp.trim(),
      });

      authTokenStorage.set(result.verifyOtp.accessToken);
      const destination =
        result.verifyOtp.user.role === 'WORKER' ? '/worker/profile' : '/workers';

      setNextHref(destination);
      setStatus(
        `${result.verifyOtp.user.name} হিসেবে লগইন সম্পন্ন হয়েছে। আপনাকে পরের পেজে নেওয়া হচ্ছে।`
      );
      router.push(destination);
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
            <Input
              id="phone"
              name="phone"
              required
              placeholder="01XXXXXXXXX"
              value={phone}
              inputMode="tel"
              maxLength={11}
              pattern="01[0-9]{9}"
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSendingOtp || !phone}
            onClick={handleSendOtp}
          >
            {isSendingOtp ? 'OTP পাঠানো হচ্ছে' : 'OTP পাঠান'}
          </Button>
          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              name="otp"
              required
              inputMode="numeric"
              maxLength={6}
              minLength={6}
              placeholder="123456"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>
          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'যাচাই হচ্ছে' : 'যাচাই করুন'}
          </Button>
        </form>
        {status ? <p className="mt-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}
        {nextHref ? (
          <Button asChild className="mt-3 w-full">
            <Link href={nextHref}>
              {nextHref === '/worker/profile' ? 'প্রোফাইলে যান' : 'কর্মী খুঁজুন'}
            </Link>
          </Button>
        ) : null}
      </div>
    </main>
  );
}
