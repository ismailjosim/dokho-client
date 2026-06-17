'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Filter, Loader2, Search, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/ui/select-field';
import { WorkerResultCard, type WorkerResult } from '@/components/workers/worker-result-card';
import {
  findOption,
  getDistrictOptions,
  type SelectOption,
} from '@/lib/location-options';
import { getWorkerServiceOptions } from '@/lib/service-options';
import { graphqlRequest } from '@/services/graphql/client';

const WORKERS_QUERY = /* GraphQL */ `
  query Workers($skill: String, $district: String, $limit: Int) {
    workers(skill: $skill, district: $district, limit: $limit) {
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

function getInitialFilters() {
  if (typeof window === 'undefined') {
    return { skill: '', district: '' };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    skill: params.get('skill') || '',
    district: params.get('district') || '',
  };
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerResult[]>([]);
  const [status, setStatus] = useState('সার্চ করলে অনুমোদিত কর্মীদের তালিকা দেখা যাবে।');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialFilters] = useState(getInitialFilters);
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SelectOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption | null>(null);

  const searchWorkers = useCallback(async (skill: string, district: string) => {
    setIsLoading(true);
    setStatus('');
    setHasSearched(true);

    try {
      const result = await graphqlRequest<{ workers: WorkerResult[] }>(WORKERS_QUERY, {
        skill: skill || undefined,
        district: district || undefined,
        limit: 20,
      });

      setWorkers(result.workers);
      setStatus('');
    } catch (error) {
      setWorkers([]);
      setStatus(error instanceof Error ? error.message : 'কর্মী খোঁজা যায়নি');
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await searchWorkers(selectedSkill?.value || '', selectedDistrict?.value || '');
  }

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      const [services, districts] = await Promise.all([
        getWorkerServiceOptions(),
        getDistrictOptions(),
      ]);

      if (!isMounted) return;

      setServiceOptions(services);
      setSelectedSkill(findOption(services, initialFilters.skill));
      setDistrictOptions(districts);
      setSelectedDistrict(findOption(districts, initialFilters.district));
    }

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, [initialFilters.district, initialFilters.skill]);

  useEffect(() => {
    if (!initialFilters.skill && !initialFilters.district) {
      return;
    }

    const timer = window.setTimeout(() => {
      void searchWorkers(initialFilters.skill, initialFilters.district);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialFilters.district, initialFilters.skill, searchWorkers]);

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-foreground text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Button variant="secondary" asChild className="mb-6 w-fit">
            <Link href="/">
              <ArrowLeft />
              হোমে ফিরুন
            </Link>
          </Button>
          <div className="max-w-3xl">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/72">
              <Filter className="size-4" />
              কর্মী প্রোফাইল ডিরেক্টরি
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
              সেবা, জেলা ও অভিজ্ঞতা দেখে যাচাইকৃত কর্মী বাছাই করুন
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72">
              প্রোফাইল দেখা ফ্রি। পছন্দ হলে পেমেন্ট ক্রেডিট ব্যবহার করে ফোন নম্বর আনলক করুন।
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Search className="size-5 text-primary" />
            <h2 className="text-2xl font-bold">ফিল্টার</h2>
          </div>
        <form
          key={`${initialFilters.skill}-${initialFilters.district}`}
          className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={handleSearch}
        >
          <div className="space-y-2">
            <Label htmlFor="skill">সেবা</Label>
            <SelectField
              inputId="skill"
              name="skill"
              options={serviceOptions}
              value={selectedSkill}
              placeholder="সেবা নির্বাচন করুন"
              onChange={setSelectedSkill}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">জেলা</Label>
            <SelectField
              inputId="district"
              name="district"
              options={districtOptions}
              value={selectedDistrict}
              placeholder="জেলা নির্বাচন করুন"
              onChange={setSelectedDistrict}
            />
          </div>
          <Button className="self-end" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
            {isLoading ? 'খোঁজা হচ্ছে' : 'খুঁজুন'}
          </Button>
        </form>
        </div>

        {status ? (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-muted p-3 text-sm">
            {hasSearched ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> : null}
            <p>{status}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
            <Loader2 className="mx-auto mb-3 size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">অনুমোদিত কর্মীদের তালিকা খোঁজা হচ্ছে...</p>
          </div>
        ) : null}

        {!isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {workers.map((worker) => (
              <WorkerResultCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : null}

        {hasSearched && !isLoading && !status && workers.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
            <SearchX className="mx-auto mb-3 size-8 text-muted-foreground" />
            <h2 className="text-lg font-bold">কোনো অনুমোদিত কর্মী পাওয়া যায়নি</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              সেবা বা জেলার নাম একটু পরিবর্তন করে আবার খুঁজে দেখুন।
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
