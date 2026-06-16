'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';

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
  const [workers, setWorkers] = useState<PendingWorker[]>([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function loadPendingWorkers() {
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে অ্যাডমিন হিসেবে লগইন করুন।');
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
    }
  }

  async function moderateWorker(id: string, action: 'approve' | 'deactivate') {
    const token = authTokenStorage.get();

    if (!token) {
      setStatus('আগে অ্যাডমিন হিসেবে লগইন করুন।');
      return;
    }

    setIsLoading(true);
    setStatus('');

    try {
      await graphqlRequest(
        action === 'approve' ? APPROVE_WORKER : DEACTIVATE_WORKER,
        { id },
        token
      );
      setWorkers((current) => current.filter((worker) => worker.id !== id));
      setStatus(action === 'approve' ? 'প্রোফাইল অনুমোদিত হয়েছে।' : 'প্রোফাইল ডিঅ্যাক্টিভ হয়েছে।');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'অ্যাকশন সম্পন্ন হয়নি');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPendingWorkers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" asChild className="w-fit px-0">
          <Link href="/">
            <ArrowLeft />
            {bn.nav.home}
          </Link>
        </Button>
        <Button variant="outline" onClick={loadPendingWorkers} disabled={isLoading}>
          <RefreshCw />
          {bn.action.refresh}
        </Button>
      </div>

      <section className="mb-6 rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              অপেক্ষমান কর্মী প্রোফাইল যাচাই করে অনুমোদন বা ডিঅ্যাক্টিভ করুন।
            </p>
          </div>
        </div>
      </section>

      {status ? <p className="mb-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}

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
            <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              <p>{worker.user.phone}</p>
              <p>{[worker.area, worker.upazila, worker.district].filter(Boolean).join(', ')}</p>
              <p>
                {bn.field.experience}: {worker.experienceYears} বছর
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => moderateWorker(worker.id, 'approve')} disabled={isLoading}>
                <CheckCircle2 />
                {bn.action.approve}
              </Button>
              <Button
                variant="outline"
                onClick={() => moderateWorker(worker.id, 'deactivate')}
                disabled={isLoading}
              >
                <XCircle />
                {bn.action.deactivate}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
