'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { WorkerResultCard, type WorkerResult } from '@/components/workers/worker-result-card';
import { graphqlRequest } from '@/services/graphql/client';

const FEATURED_WORKERS_QUERY = /* GraphQL */ `
  query FeaturedWorkers {
    workers(limit: 4) {
      id
      skill
      district
      upazila
      area
      profilePhotoUrl
      experienceYears
      availability
      user {
        name
        maskedPhone
      }
    }
  }
`;

export function HomeFeaturedWorkers() {
  const [workers, setWorkers] = useState<WorkerResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadWorkers() {
      setIsLoading(true);
      setStatus('');

      try {
        const result = await graphqlRequest<{ workers: WorkerResult[] }>(FEATURED_WORKERS_QUERY);

        setWorkers(result.workers);
        setStatus(result.workers.length ? '' : 'এখনো কোনো ভেরিফাইড কর্মী নেই।');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'কর্মীর তালিকা আনা যায়নি');
      } finally {
        setIsLoading(false);
      }
    }

    void loadWorkers();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
        <Loader2 className="mx-auto mb-3 size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">ভেরিফাইড কর্মী লোড হচ্ছে...</p>
      </div>
    );
  }

  if (status) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
        <SearchX className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{status}</p>
        <Button asChild className="mt-4">
          <Link href="/workers">সব কর্মী দেখুন</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workers.map((worker) => (
        <WorkerResultCard key={worker.id} worker={worker} />
      ))}
    </div>
  );
}
