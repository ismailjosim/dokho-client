'use client';

import { type FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BriefcaseBusiness, CreditCard, Hammer, Loader2, MapPin, Phone } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <Button variant="ghost" asChild className="mb-6 w-fit px-0">
        <Link href="/workers">
          <ArrowLeft />
          কর্মী তালিকায় ফিরুন
        </Link>
      </Button>

      {isLoading ? (
        <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
          <Loader2 className="mx-auto mb-3 size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">কর্মীর তথ্য লোড হচ্ছে...</p>
        </div>
      ) : null}

      {status ? <p className="rounded-md bg-muted p-3 text-sm">{status}</p> : null}

      {worker ? (
        <article className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="success">অনুমোদিত</Badge>
            <Badge variant="secondary">{worker.skill}</Badge>
            <Badge variant={worker.availability === 'AVAILABLE' ? 'success' : 'outline'}>
              {worker.availability === 'AVAILABLE' ? 'কাজ নিতে পারবেন' : 'এখন ব্যস্ত'}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold">{worker.user.name}</h1>
          {worker.profilePhotoUrl ? (
            <a
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              href={worker.profilePhotoUrl}
              target="_blank"
              rel="noreferrer"
            >
              প্রোফাইল ছবি দেখুন
            </a>
          ) : null}

          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {getWorkerLocation(worker)}
            </p>
            <p className="flex items-center gap-2">
              <Hammer className="size-4 text-primary" />
              অভিজ্ঞতা {worker.experienceYears} বছর
            </p>
            <p className="flex items-center gap-2">
              <BriefcaseBusiness className="size-4 text-primary" />
              {worker.skill}
            </p>
          </div>

          <div className="mt-5 rounded-md border bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">যোগাযোগ নম্বর</p>
                <p className="text-sm text-muted-foreground">
                  ক্রেডিট: {availableCredits} | ১টি নম্বর দেখতে ৳২০ অথবা ১০টি নম্বর ৳১০০
                </p>
              </div>
              {unlockedPhone ? (
                <Button asChild>
                  <a href={`tel:${unlockedPhone}`}>
                    <Phone />
                    {unlockedPhone}
                  </a>
                </Button>
              ) : (
                <Button onClick={handleUnlockContact} disabled={isUnlocking}>
                  {isUnlocking ? <Loader2 className="animate-spin" /> : <Phone />}
                  নম্বর আনলক করুন
                </Button>
              )}
            </div>
          </div>

          <form className="mt-4 grid gap-3 rounded-md border bg-background p-4" onSubmit={handleCreatePayment}>
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <h2 className="font-semibold">পেমেন্ট রিকোয়েস্ট</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
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
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="senderPhone">প্রেরক নম্বর</Label>
                <Input id="senderPhone" name="senderPhone" placeholder="01XXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionId">ট্রানজেকশন আইডি</Label>
                <Input id="transactionId" name="transactionId" placeholder="যেমন: TXN123" />
              </div>
            </div>
            <Button className="w-full sm:w-fit" disabled={isPaying}>
              {isPaying ? <Loader2 className="animate-spin" /> : <CreditCard />}
              রিকোয়েস্ট জমা দিন
            </Button>
          </form>
        </article>
      ) : null}
    </main>
  );
}
