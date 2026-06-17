'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
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
  experienceYears: number;
  availability: 'AVAILABLE' | 'NOT_AVAILABLE';
  status: 'PENDING' | 'APPROVED' | 'DEACTIVATED';
  user: {
    name: string;
    phone: string;
  };
};

const PENDING_WORKERS = /* GraphQL */ `
  query PendingWorkerProfiles {
    pendingWorkerProfiles {
      id
      skill
      district
      upazila
      area
      experienceYears
      availability
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<PendingWorker[]>([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeWorkerId, setActiveWorkerId] = useState('');

  async function loadPendingWorkers() {
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে অ্যাডমিন হিসেবে লগইন করুন।');
      router.push('/admin/login');
      return;
    }

    setIsLoading(true);
    setStatus('');

    try {
      const result = await graphqlRequest<{ pendingWorkerProfiles: PendingWorker[] }>(
        PENDING_WORKERS,
        undefined,
        token
      );
      setWorkers(result.pendingWorkerProfiles);
      setStatus(result.pendingWorkerProfiles.length ? '' : 'এখন কোনো অপেক্ষমান প্রোফাইল নেই।');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'প্রোফাইল লোড করা যায়নি');
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPendingWorkers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

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
            <p className="mt-1 text-2xl font-bold">{workers.length}</p>
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

        {!isLoading && hasLoaded && workers.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
            <Clock3 className="mx-auto mb-3 size-8 text-muted-foreground" />
            <h2 className="text-lg font-bold">কোনো অপেক্ষমান প্রোফাইল নেই</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              নতুন কর্মী প্রোফাইল জমা হলে এখানে দেখা যাবে।
            </p>
          </div>
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
