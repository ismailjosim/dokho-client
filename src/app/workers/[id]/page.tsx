'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BriefcaseBusiness, Hammer, Loader2, MapPin, Phone } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { graphqlRequest } from '@/services/graphql/client';

type WorkerProfileDetails = {
  id: string;
  skill: string;
  district: string;
  upazila?: string | null;
  area?: string | null;
  experienceYears: number;
  availability: 'AVAILABLE' | 'NOT_AVAILABLE';
  user: {
    name: string;
    phone?: string | null;
  };
};

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
      user {
        name
        phone
      }
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

          <Button asChild className="mt-5 w-full sm:w-auto">
            <a href={`tel:${worker.user.phone}`}>
              <Phone />
              কল করুন
            </a>
          </Button>
        </article>
      ) : null}
    </main>
  );
}
