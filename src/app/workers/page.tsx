'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hammer, MapPin, Phone, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { graphqlRequest } from '@/services/graphql/client';

type Worker = {
  id: string;
  skill: string;
  district: string;
  upazila?: string | null;
  area?: string | null;
  experienceYears: number;
  availability: 'AVAILABLE' | 'NOT_AVAILABLE';
  user: {
    name: string;
    phone: string;
  };
};

const WORKERS_QUERY = /* GraphQL */ `
  query Workers($skill: String, $district: String, $limit: Int) {
    workers(skill: $skill, district: $district, limit: $limit) {
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

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [status, setStatus] = useState('সার্চ করলে অনুমোদিত কর্মীদের তালিকা দেখা যাবে।');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus('');

    const formData = new FormData(event.currentTarget);
    const skill = String(formData.get('skill') || '').trim();
    const district = String(formData.get('district') || '').trim();

    try {
      const result = await graphqlRequest<{ workers: Worker[] }>(WORKERS_QUERY, {
        skill: skill || undefined,
        district: district || undefined,
        limit: 20,
      });

      setWorkers(result.workers);
      setStatus(result.workers.length ? '' : 'এই ফিল্টারে কোনো অনুমোদিত কর্মী পাওয়া যায়নি।');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'কর্মী খোঁজা যায়নি');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6">
      <Button variant="ghost" asChild className="mb-6 w-fit px-0">
        <Link href="/">
          <ArrowLeft />
          হোমে ফিরুন
        </Link>
      </Button>
      <div className="mb-6 rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Search className="size-5 text-primary" />
          <h1 className="text-2xl font-bold">কর্মী সার্চ</h1>
        </div>
        <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleSearch}>
          <div className="space-y-2">
            <Label htmlFor="skill">সেবা</Label>
            <Input id="skill" name="skill" placeholder="প্লাম্বার" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">জেলা</Label>
            <Input id="district" name="district" placeholder="ঢাকা" />
          </div>
          <Button className="self-end" disabled={isLoading}>
            <Search />
            খুঁজুন
          </Button>
        </form>
      </div>

      {status ? <p className="mb-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}

      <div className="space-y-4">
        {workers.map((worker) => (
          <article key={worker.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{worker.skill}</Badge>
              <Badge variant={worker.availability === 'AVAILABLE' ? 'success' : 'outline'}>
                {worker.availability === 'AVAILABLE' ? 'কাজ নিতে পারবেন' : 'এখন ব্যস্ত'}
              </Badge>
            </div>
            <h2 className="text-xl font-bold">{worker.user.name}</h2>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" />
                {[worker.area, worker.upazila, worker.district].filter(Boolean).join(', ')}
              </span>
              <span className="inline-flex items-center gap-1">
                <Hammer className="size-4" />
                অভিজ্ঞতা {worker.experienceYears} বছর
              </span>
            </div>
            <Button asChild className="mt-4">
              <a href={`tel:${worker.user.phone}`}>
                <Phone />
                কল করুন
              </a>
            </Button>
          </article>
        ))}
      </div>
    </main>
  );
}
