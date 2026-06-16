'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hammer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authTokenStorage, graphqlRequest } from '@/services/graphql/client';

const UPSERT_PROFILE = /* GraphQL */ `
  mutation UpsertMyWorkerProfile($input: WorkerProfileInput!) {
    upsertMyWorkerProfile(input: $input) {
      id
      skill
      district
      status
      availability
    }
  }
`;

export default function WorkerProfilePage() {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(event.currentTarget);
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে OTP দিয়ে লগইন করুন।');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await graphqlRequest<{
        upsertMyWorkerProfile: { status: string };
      }>(
        UPSERT_PROFILE,
        {
          input: {
            skill: String(formData.get('skill') || ''),
            district: String(formData.get('district') || ''),
            upazila: String(formData.get('upazila') || ''),
            area: String(formData.get('area') || ''),
            experienceYears: Number(formData.get('experienceYears') || 0),
            availability: String(formData.get('availability') || 'AVAILABLE'),
          },
        },
        token
      );

      setStatus(`প্রোফাইল জমা হয়েছে। বর্তমান স্ট্যাটাস: ${result.upsertMyWorkerProfile.status}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'প্রোফাইল জমা দেওয়া যায়নি');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-8">
      <Button variant="ghost" asChild className="mb-6 w-fit px-0">
        <Link href="/">
          <ArrowLeft />
          হোমে ফিরুন
        </Link>
      </Button>
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Hammer className="size-5 text-primary" />
          <h1 className="text-2xl font-bold">কর্মীর প্রোফাইল</h1>
        </div>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="skill">সেবা</Label>
            <Input id="skill" name="skill" required placeholder="প্লাম্বার" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">জেলা</Label>
            <Input id="district" name="district" required placeholder="ঢাকা" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upazila">উপজেলা/থানা</Label>
            <Input id="upazila" name="upazila" placeholder="মিরপুর" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">এলাকা</Label>
            <Input id="area" name="area" placeholder="মিরপুর ১০" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experienceYears">অভিজ্ঞতা</Label>
            <Input
              id="experienceYears"
              name="experienceYears"
              type="number"
              min={0}
              defaultValue={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">অবস্থা</Label>
            <select
              id="availability"
              name="availability"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue="AVAILABLE"
            >
              <option value="AVAILABLE">এখন কাজ নিতে পারি</option>
              <option value="NOT_AVAILABLE">এখন ব্যস্ত</option>
            </select>
          </div>
          <Button className="sm:col-span-2" disabled={isSubmitting}>
            প্রোফাইল জমা দিন
          </Button>
        </form>
        {status ? <p className="mt-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}
      </div>
    </main>
  );
}
