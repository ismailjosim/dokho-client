'use client';

import { type FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CreditCard,
  Hammer,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/site/language-switcher';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { authTokenStorage, graphqlRequest } from '@/services/graphql/client';

type WorkerProfileDetails = {
  id: string;
  skill: string;
  district: string;
  upazila?: string | null;
  area?: string | null;
  experienceYears: number;
  availability: 'AVAILABLE' | 'NOT_AVAILABLE';
  profilePhotoUrl?: string | null;
  user: {
    name: string;
  };
};

type PaymentMethod = 'BKASH' | 'NAGAD' | 'SSLCOMMERZ';
type PaymentPlan = 'SINGLE_CONTACT' | 'BULK_10_CONTACTS';

const WORKER_PROFILE_QUERY = /* GraphQL */ `
  query WorkerProfile($id: ID!) {
    workerProfile(id: $id) {
      id
      skill
      district
      upazila
      area
      experienceYears
      availability
      profilePhotoUrl
      user {
        name
      }
    }
  }
`;

const CONTACT_ACCESS_QUERY = /* GraphQL */ `
  query ContactAccessSummary {
    contactAccessSummary {
      availableCredits
      unlockedWorkerProfileIds
    }
  }
`;

const UNLOCK_CONTACT = /* GraphQL */ `
  mutation UnlockWorkerContact($workerProfileId: ID!) {
    unlockWorkerContact(workerProfileId: $workerProfileId) {
      workerProfileId
      phone
      availableCredits
    }
  }
`;

const CREATE_PAYMENT_REQUEST = /* GraphQL */ `
  mutation CreatePaymentRequest($input: CreatePaymentRequestInput!) {
    createPaymentRequest(input: $input) {
      id
      amount
      credits
      status
    }
  }
`;

function getWorkerLocation(worker: WorkerProfileDetails) {
  return [worker.area, worker.upazila, worker.district].filter(Boolean).join(', ');
}

export default function WorkerDetailsPage() {
  const params = useParams<{ id: string }>();
  const [worker, setWorker] = useState<WorkerProfileDetails | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [unlockedPhone, setUnlockedPhone] = useState('');

  useEffect(() => {
    async function loadWorkerProfile() {
      setIsLoading(true);
      setStatus('');

      try {
        const result = await graphqlRequest<{ workerProfile: WorkerProfileDetails }>(
          WORKER_PROFILE_QUERY,
          { id: params.id }
        );

        setWorker(result.workerProfile);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'কর্মীর তথ্য পাওয়া যায়নি');
      } finally {
        setIsLoading(false);
      }
    }

    void loadWorkerProfile();
  }, [params.id]);

  useEffect(() => {
    async function loadContactAccess() {
      const token = authTokenStorage.get();

      if (!token) return;

      try {
        const result = await graphqlRequest<{
          contactAccessSummary: {
            availableCredits: number;
            unlockedWorkerProfileIds: string[];
          };
        }>(CONTACT_ACCESS_QUERY, undefined, token);

        setAvailableCredits(result.contactAccessSummary.availableCredits);
      } catch {
        setAvailableCredits(0);
      }
    }

    void loadContactAccess();
  }, []);

  async function handleUnlockContact() {
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('যোগাযোগ নম্বর দেখতে আগে OTP দিয়ে লগইন করুন।');
      return;
    }

    setIsUnlocking(true);
    setStatus('');

    try {
      const result = await graphqlRequest<{
        unlockWorkerContact: {
          phone: string;
          availableCredits: number;
        };
      }>(UNLOCK_CONTACT, { workerProfileId: params.id }, token);

      setUnlockedPhone(result.unlockWorkerContact.phone);
      setAvailableCredits(result.unlockWorkerContact.availableCredits);
      setStatus('যোগাযোগ নম্বর আনলক হয়েছে।');
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'যোগাযোগ নম্বর আনলক করতে পেমেন্ট ক্রেডিট প্রয়োজন'
      );
    } finally {
      setIsUnlocking(false);
    }
  }

  async function handleCreatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = authTokenStorage.get();

    if (!token) {
      setStatus('পেমেন্ট রিকোয়েস্ট করতে আগে OTP দিয়ে লগইন করুন।');
      return;
    }

    const formData = new FormData(event.currentTarget);
    setIsPaying(true);
    setStatus('');

    try {
      await graphqlRequest(
        CREATE_PAYMENT_REQUEST,
        {
          input: {
            method: String(formData.get('method') || 'BKASH') as PaymentMethod,
            plan: String(formData.get('plan') || 'SINGLE_CONTACT') as PaymentPlan,
            senderPhone: String(formData.get('senderPhone') || '').trim(),
            transactionId: String(formData.get('transactionId') || '').trim(),
          },
        },
        token
      );
      setStatus('পেমেন্ট রিকোয়েস্ট জমা হয়েছে। অ্যাডমিন অনুমোদনের পর ক্রেডিট যোগ হবে।');
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'পেমেন্ট রিকোয়েস্ট জমা হয়নি');
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-foreground text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="secondary" asChild className="w-fit">
              <Link href="/workers">
                <ArrowLeft />
                কর্মী তালিকায় ফিরুন
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <p className="flex items-center gap-2 text-sm font-semibold text-white/72">
            <ShieldCheck className="size-4" />
            যাচাইকৃত কর্মী প্রোফাইল
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
            প্রোফাইল দেখে সিদ্ধান্ত নিন, যোগাযোগ নম্বর আনলক করুন
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
            <Loader2 className="mx-auto mb-3 size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">কর্মীর তথ্য লোড হচ্ছে...</p>
          </div>
        ) : null}

        {status ? <p className="mb-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}

        {worker ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <article className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                <div className="flex min-h-80 items-center justify-center bg-muted">
                  {worker.profilePhotoUrl ? (
                    <div
                      aria-label={`${worker.user.name} এর প্রোফাইল ছবি`}
                      className="h-full min-h-80 w-full bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${worker.profilePhotoUrl})` }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UserRound className="size-14" />
                      <span className="text-sm">প্রোফাইল ছবি নেই</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge variant="success">
                      <BadgeCheck />
                      ভেরিফাইড
                    </Badge>
                    <Badge variant="secondary">{worker.skill}</Badge>
                    <Badge variant={worker.availability === 'AVAILABLE' ? 'success' : 'outline'}>
                      {worker.availability === 'AVAILABLE' ? 'কাজ নিতে পারবেন' : 'এখন ব্যস্ত'}
                    </Badge>
                  </div>

                  <h2 className="text-3xl font-bold">{worker.user.name}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    এই প্রোফাইল অ্যাডমিন দ্বারা যাচাই করা হয়েছে। যোগাযোগের আগে এলাকা, সেবা ও
                    অভিজ্ঞতা মিলিয়ে নিন।
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border bg-background p-4">
                      <MapPin className="mb-2 size-5 text-primary" />
                      <p className="text-sm text-muted-foreground">লোকেশন</p>
                      <p className="mt-1 font-semibold">{getWorkerLocation(worker)}</p>
                    </div>
                    <div className="rounded-md border bg-background p-4">
                      <Hammer className="mb-2 size-5 text-primary" />
                      <p className="text-sm text-muted-foreground">অভিজ্ঞতা</p>
                      <p className="mt-1 font-semibold">{worker.experienceYears} বছর</p>
                    </div>
                    <div className="rounded-md border bg-background p-4 sm:col-span-2">
                      <BriefcaseBusiness className="mb-2 size-5 text-primary" />
                      <p className="text-sm text-muted-foreground">সেবা</p>
                      <p className="mt-1 font-semibold">{worker.skill}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <aside className="space-y-4">
              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <p className="mb-1 text-sm font-semibold text-primary">যোগাযোগ অ্যাক্সেস</p>
                <h2 className="text-2xl font-bold">নম্বর আনলক</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  ক্রেডিট: {availableCredits} | ১টি নম্বর দেখতে ৳২০ অথবা ১০টি নম্বর ৳১০০
                </p>
                {unlockedPhone ? (
                  <Button asChild className="mt-4 w-full">
                    <a href={`tel:${unlockedPhone}`}>
                      <Phone />
                      {unlockedPhone}
                    </a>
                  </Button>
                ) : (
                  <Button className="mt-4 w-full" onClick={handleUnlockContact} disabled={isUnlocking}>
                    {isUnlocking ? <Loader2 className="animate-spin" /> : <Phone />}
                    নম্বর আনলক করুন
                  </Button>
                )}
              </div>

              <form className="grid gap-3 rounded-lg border bg-card p-5 shadow-sm" onSubmit={handleCreatePayment}>
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" />
                  <h2 className="font-semibold">পেমেন্ট রিকোয়েস্ট</h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">প্ল্যান</Label>
                  <select
                    id="plan"
                    name="plan"
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue="SINGLE_CONTACT"
                  >
                    <option value="SINGLE_CONTACT">৳২০ - ১টি প্রোফাইল</option>
                    <option value="BULK_10_CONTACTS">৳১০০ - ১০টি প্রোফাইল</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">মেথড</Label>
                  <select
                    id="method"
                    name="method"
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue="BKASH"
                  >
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="SSLCOMMERZ">SSLCommerz</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderPhone">প্রেরক নম্বর</Label>
                  <Input id="senderPhone" name="senderPhone" placeholder="01XXXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionId">ট্রানজেকশন আইডি</Label>
                  <Input id="transactionId" name="transactionId" placeholder="যেমন: TXN123" />
                </div>
                <Button className="w-full" disabled={isPaying}>
                  {isPaying ? <Loader2 className="animate-spin" /> : <CreditCard />}
                  রিকোয়েস্ট জমা দিন
                </Button>
              </form>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}
