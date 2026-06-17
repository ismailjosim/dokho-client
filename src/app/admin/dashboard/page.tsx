'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileImage,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { bn } from '@/lib/bengali';
import { authTokenStorage, graphqlRequest } from '@/services/graphql/client';

type PendingWorker = {
  id: string;
  skill: string;
  district: string;
  upazila?: string | null;
  area?: string | null;
  profilePhotoUrl?: string | null;
  nidFrontUrl?: string | null;
  nidBackUrl?: string | null;
  experienceYears: number;
  availability: 'AVAILABLE' | 'NOT_AVAILABLE';
  status: 'PENDING' | 'APPROVED' | 'DEACTIVATED';
  user: {
    name: string;
    phone: string;
  };
};

type PendingPayment = {
  id: string;
  method: 'BKASH' | 'NAGAD' | 'SSLCOMMERZ';
  plan: 'SINGLE_CONTACT' | 'BULK_10_CONTACTS';
  amount: number;
  credits: number;
  senderPhone?: string | null;
  transactionId?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    name: string;
    phone: string;
  };
};

const PENDING_WORKERS = /* GraphQL */ `
  query AdminDashboardData {
    pendingWorkerProfiles {
      id
      skill
      district
      upazila
      area
      profilePhotoUrl
      nidFrontUrl
      nidBackUrl
      experienceYears
      availability
      status
      user {
        name
        phone
      }
    }
    pendingPaymentRequests {
      id
      method
      plan
      amount
      credits
      senderPhone
      transactionId
      status
      user {
        name
        phone
      }
    }
  }
`;

const APPROVE_WORKER = /* GraphQL */ `
  mutation ApproveWorkerProfile($id: ID!) {
    approveWorkerProfile(id: $id) {
      id
      status
    }
  }
`;

const DEACTIVATE_WORKER = /* GraphQL */ `
  mutation DeactivateWorkerProfile($id: ID!) {
    deactivateWorkerProfile(id: $id) {
      id
      status
    }
  }
`;

const APPROVE_PAYMENT = /* GraphQL */ `
  mutation ApprovePaymentRequest($id: ID!) {
    approvePaymentRequest(id: $id) {
      id
      status
    }
  }
`;

const REJECT_PAYMENT = /* GraphQL */ `
  mutation RejectPaymentRequest($id: ID!) {
    rejectPaymentRequest(id: $id) {
      id
      status
    }
  }
`;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<PendingWorker[]>([]);
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeWorkerId, setActiveWorkerId] = useState('');

  const loadPendingWorkers = useCallback(async () => {
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে অ্যাডমিন হিসেবে লগইন করুন।');
      router.push('/admin/login');
      return;
    }

    setIsLoading(true);
    setStatus('');

    try {
      const result = await graphqlRequest<{
        pendingWorkerProfiles: PendingWorker[];
        pendingPaymentRequests: PendingPayment[];
      }>(
        PENDING_WORKERS,
        undefined,
        token
      );
      setWorkers(result.pendingWorkerProfiles);
      setPayments(result.pendingPaymentRequests);
      setStatus(
        result.pendingWorkerProfiles.length || result.pendingPaymentRequests.length
          ? ''
          : 'এখন কোনো অপেক্ষমান প্রোফাইল বা পেমেন্ট নেই।'
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'প্রোফাইল লোড করা যায়নি');
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [router]);

  async function moderateWorker(worker: PendingWorker, action: 'approve' | 'deactivate') {
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে অ্যাডমিন হিসেবে লগইন করুন।');
      router.push('/admin/login');
      return;
    }

    if (action === 'deactivate') {
      const isConfirmed = window.confirm(`${worker.user.name} এর প্রোফাইল ডিঅ্যাক্টিভ করবেন?`);

      if (!isConfirmed) {
        return;
      }
    }

    setActiveWorkerId(worker.id);
    setStatus('');

    try {
      await graphqlRequest(
        action === 'approve' ? APPROVE_WORKER : DEACTIVATE_WORKER,
        { id: worker.id },
        token
      );
      setStatus(
        action === 'approve'
          ? `${worker.user.name} এর প্রোফাইল অনুমোদিত হয়েছে।`
          : `${worker.user.name} এর প্রোফাইল ডিঅ্যাক্টিভ হয়েছে।`
      );
      await loadPendingWorkers();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'অ্যাকশন সম্পন্ন হয়নি');
    } finally {
      setActiveWorkerId('');
    }
  }

  async function moderatePayment(payment: PendingPayment, action: 'approve' | 'reject') {
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে অ্যাডমিন হিসেবে লগইন করুন।');
      router.push('/admin/login');
      return;
    }

    setActiveWorkerId(payment.id);
    setStatus('');

    try {
      await graphqlRequest(
        action === 'approve' ? APPROVE_PAYMENT : REJECT_PAYMENT,
        { id: payment.id },
        token
      );
      setStatus(
        action === 'approve'
          ? `${payment.user.name} এর পেমেন্ট অনুমোদিত হয়েছে।`
          : `${payment.user.name} এর পেমেন্ট বাতিল হয়েছে।`
      );
      await loadPendingWorkers();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'পেমেন্ট অ্যাকশন সম্পন্ন হয়নি');
    } finally {
      setActiveWorkerId('');
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPendingWorkers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPendingWorkers]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button variant="ghost" asChild className="w-fit px-0">
            <Link href="/">
              <ArrowLeft />
              {bn.nav.home}
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadPendingWorkers} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {bn.action.refresh}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="mb-6 rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                অপেক্ষমান কর্মী প্রোফাইল যাচাই করে অনুমোদন বা ডিঅ্যাক্টিভ করুন।
              </p>
            </div>
          </div>
        </section>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">অপেক্ষমান</p>
            <p className="mt-1 text-2xl font-bold">{workers.length + payments.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">অ্যাকশন</p>
            <p className="mt-1 text-base font-semibold">অনুমোদন / ডিঅ্যাক্টিভ</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">স্ট্যাটাস</p>
            <p className="mt-1 text-base font-semibold">{isLoading ? 'লোড হচ্ছে' : 'প্রস্তুত'}</p>
          </div>
        </div>

        {status ? <p className="mb-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}

        {isLoading && !hasLoaded ? (
          <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
            <Loader2 className="mx-auto mb-3 size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">অপেক্ষমান প্রোফাইল লোড হচ্ছে...</p>
          </div>
        ) : null}

        {!isLoading && hasLoaded && workers.length === 0 && payments.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
            <Clock3 className="mx-auto mb-3 size-8 text-muted-foreground" />
            <h2 className="text-lg font-bold">কোনো অপেক্ষমান কাজ নেই</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              নতুন কর্মী প্রোফাইল বা পেমেন্ট জমা হলে এখানে দেখা যাবে।
            </p>
          </div>
        ) : null}

        {payments.length ? (
          <section className="mb-6 space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <CreditCard className="size-5 text-primary" />
              পেমেন্ট যাচাই
            </h2>
            {payments.map((payment) => (
              <article key={payment.id} className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="outline">পেমেন্ট অপেক্ষমান</Badge>
                  <Badge variant="secondary">{payment.method}</Badge>
                  <Badge variant="success">{payment.credits} ক্রেডিট</Badge>
                </div>
                <h3 className="text-lg font-bold">{payment.user.name}</h3>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <p>অ্যাকাউন্ট: {payment.user.phone}</p>
                  <p>প্ল্যান: {payment.plan === 'SINGLE_CONTACT' ? '১ প্রোফাইল' : '১০ প্রোফাইল'}</p>
                  <p>টাকা: ৳{payment.amount}</p>
                  <p>প্রেরক নম্বর: {payment.senderPhone || 'দেওয়া হয়নি'}</p>
                  <p className="sm:col-span-2">
                    ট্রানজেকশন আইডি: {payment.transactionId || 'দেওয়া হয়নি'}
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={() => moderatePayment(payment, 'approve')}
                    disabled={Boolean(activeWorkerId)}
                  >
                    {activeWorkerId === payment.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <CheckCircle2 />
                    )}
                    অনুমোদন
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => moderatePayment(payment, 'reject')}
                    disabled={Boolean(activeWorkerId)}
                  >
                    {activeWorkerId === payment.id ? <Loader2 className="animate-spin" /> : <XCircle />}
                    বাতিল
                  </Button>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        <div className="space-y-4">
          {workers.map((worker) => (
            <article key={worker.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="outline">{bn.status.pending}</Badge>
                <Badge variant="secondary">{worker.skill}</Badge>
                <Badge variant={worker.availability === 'AVAILABLE' ? 'success' : 'outline'}>
                  {worker.availability === 'AVAILABLE' ? bn.status.available : bn.status.notAvailable}
                </Badge>
              </div>
              <h2 className="text-xl font-bold">{worker.user.name}</h2>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  {worker.user.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  {[worker.area, worker.upazila, worker.district].filter(Boolean).join(', ')}
                </p>
                <p className="flex items-center gap-2">
                  <UserRound className="size-4 text-primary" />
                  {bn.field.experience}: {worker.experienceYears} বছর
                </p>
                <p className="flex items-center gap-2">
                  <FileImage className="size-4 text-primary" />
                  ছবি: {worker.profilePhotoUrl ? (
                    <a className="text-primary hover:underline" href={worker.profilePhotoUrl} target="_blank" rel="noreferrer">
                      দেখুন
                    </a>
                  ) : (
                    'নেই'
                  )}
                </p>
                <p className="flex items-center gap-2 sm:col-span-2">
                  <FileImage className="size-4 text-primary" />
                  NID:{' '}
                  {worker.nidFrontUrl ? (
                    <a className="text-primary hover:underline" href={worker.nidFrontUrl} target="_blank" rel="noreferrer">
                      সামনের ছবি
                    </a>
                  ) : (
                    'সামনের ছবি নেই'
                  )}
                  {worker.nidBackUrl ? (
                    <a className="text-primary hover:underline" href={worker.nidBackUrl} target="_blank" rel="noreferrer">
                      পেছনের ছবি
                    </a>
                  ) : null}
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => moderateWorker(worker, 'approve')}
                  disabled={Boolean(activeWorkerId)}
                >
                  {activeWorkerId === worker.id ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <CheckCircle2 />
                  )}
                  {activeWorkerId === worker.id ? 'প্রসেস হচ্ছে' : bn.action.approve}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => moderateWorker(worker, 'deactivate')}
                  disabled={Boolean(activeWorkerId)}
                >
                  {activeWorkerId === worker.id ? <Loader2 className="animate-spin" /> : <XCircle />}
                  {activeWorkerId === worker.id ? 'প্রসেস হচ্ছে' : bn.action.deactivate}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
