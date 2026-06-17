'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, Hammer, Phone, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authTokenStorage, graphqlRequest } from '@/services/graphql/client';

type AccountUser = {
  name: string;
  phone: string;
  role: string;
};

type MyWorkerProfile = {
  skill: string;
  district: string;
  upazila?: string | null;
  area?: string | null;
  experienceYears: number;
  availability: 'AVAILABLE' | 'NOT_AVAILABLE';
  status: 'PENDING' | 'APPROVED' | 'DEACTIVATED';
};

const PROFILE_QUERY = /* GraphQL */ `
  query WorkerProfileSetup {
    me {
      name
      phone
      role
    }
    myWorkerProfile {
      skill
      district
      upazila
      area
      experienceYears
      availability
      status
    }
  }
`;

const UPSERT_PROFILE = /* GraphQL */ `
  mutation UpsertMyWorkerProfile($input: WorkerProfileInput!) {
    upsertMyWorkerProfile(input: $input) {
      id
      skill
      district
      upazila
      area
      experienceYears
      status
      availability
    }
  }
`;

export default function WorkerProfilePage() {
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [profile, setProfile] = useState<MyWorkerProfile | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProfile = useCallback(async () => {
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে OTP দিয়ে লগইন করুন।');
      setIsLoading(false);
      return;
    }

    try {
      const result = await graphqlRequest<{
        me: AccountUser | null;
        myWorkerProfile: MyWorkerProfile | null;
      }>(PROFILE_QUERY, undefined, token);

      setAccount(result.me);
      setProfile(result.myWorkerProfile);
      setStatus(result.myWorkerProfile?.status === 'PENDING' ? 'আপনার প্রোফাইল অ্যাডমিন অনুমোদনের অপেক্ষায় আছে।' : '');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'প্রোফাইল তথ্য আনা যায়নি');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function getFormError(formData: FormData) {
    const skill = String(formData.get('skill') || '').trim();
    const district = String(formData.get('district') || '').trim();
    const experienceYears = Number(formData.get('experienceYears') || 0);

    if (skill.length < 2) return 'সেবার নাম কমপক্ষে ২ অক্ষর দিন।';
    if (district.length < 2) return 'জেলার নাম কমপক্ষে ২ অক্ষর দিন।';
    if (!Number.isInteger(experienceYears) || experienceYears < 0 || experienceYears > 60) {
      return 'অভিজ্ঞতা ০ থেকে ৬০ বছরের মধ্যে দিন।';
    }

    return '';
  }

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

    const formError = getFormError(formData);

    if (formError) {
      setStatus(formError);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await graphqlRequest<{
        upsertMyWorkerProfile: MyWorkerProfile;
      }>(
        UPSERT_PROFILE,
        {
          input: {
            skill: String(formData.get('skill') || '').trim(),
            district: String(formData.get('district') || '').trim(),
            upazila: String(formData.get('upazila') || '').trim(),
            area: String(formData.get('area') || '').trim(),
            experienceYears: Number(formData.get('experienceYears') || 0),
            availability: String(formData.get('availability') || 'AVAILABLE'),
          },
        },
        token
      );

      setProfile(result.upsertMyWorkerProfile);
      setStatus('প্রোফাইল জমা হয়েছে। অ্যাডমিন অনুমোদনের পর আপনার প্রোফাইল পাবলিক লিস্টে দেখা যাবে।');
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

        {isLoading ? (
          <p className="rounded-md bg-muted p-3 text-sm">প্রোফাইল তথ্য লোড হচ্ছে...</p>
        ) : null}

        {account ? (
          <div className="mb-5 grid gap-3 rounded-md border bg-background p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-primary" />
              <span className="font-medium">{account.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              <span>{account.phone}</span>
            </div>
          </div>
        ) : null}

        {profile?.status ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge variant={profile.status === 'APPROVED' ? 'success' : 'secondary'}>
              {profile.status === 'APPROVED' ? <CheckCircle2 /> : <Clock3 />}
              {profile.status === 'APPROVED'
                ? 'অনুমোদিত'
                : profile.status === 'PENDING'
                  ? 'অনুমোদনের অপেক্ষায়'
                  : 'নিষ্ক্রিয়'}
            </Badge>
          </div>
        ) : null}

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="skill">সেবা</Label>
            <Input
              id="skill"
              name="skill"
              required
              placeholder="প্লাম্বার"
              defaultValue={profile?.skill || ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">জেলা</Label>
            <Input
              id="district"
              name="district"
              required
              placeholder="ঢাকা"
              defaultValue={profile?.district || ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upazila">উপজেলা/থানা</Label>
            <Input
              id="upazila"
              name="upazila"
              placeholder="মিরপুর"
              defaultValue={profile?.upazila || ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">এলাকা</Label>
            <Input id="area" name="area" placeholder="মিরপুর ১০" defaultValue={profile?.area || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experienceYears">অভিজ্ঞতা</Label>
            <Input
              id="experienceYears"
              name="experienceYears"
              type="number"
              min={0}
              max={60}
              defaultValue={profile?.experienceYears ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">অবস্থা</Label>
            <select
              id="availability"
              name="availability"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={profile?.availability || 'AVAILABLE'}
            >
              <option value="AVAILABLE">এখন কাজ নিতে পারি</option>
              <option value="NOT_AVAILABLE">এখন ব্যস্ত</option>
            </select>
          </div>
          <Button className="sm:col-span-2" disabled={isSubmitting}>
            {isSubmitting ? 'জমা হচ্ছে' : 'প্রোফাইল জমা দিন'}
          </Button>
        </form>
        {status ? <p className="mt-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}
      </div>
    </main>
  );
}
