'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

import { WorkersFilterSidebar } from '@/components/workers/workers-filter-sidebar';
import { WorkersPageHeader } from '@/components/workers/workers-page-header';
import { WORKERS_QUERY } from '@/components/workers/workers-query';
import { WorkersResultsSection } from '@/components/workers/workers-results-section';
import type { WorkerResult } from '@/components/workers/worker-result-card';
import { findOption, getDistrictOptions, type SelectOption } from '@/lib/location-options';
import { getWorkerServiceOptions } from '@/lib/service-options';
import { graphqlRequest } from '@/services/graphql/client';

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
  const [status, setStatus] = useState('');
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

  async function handleReset() {
    setSelectedSkill(null);
    setSelectedDistrict(null);
    await searchWorkers('', '');
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
    const timer = window.setTimeout(() => {
      void searchWorkers(initialFilters.skill, initialFilters.district);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialFilters.district, initialFilters.skill, searchWorkers]);

  return (
    <main className="min-h-screen bg-background">
      <WorkersPageHeader />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <WorkersFilterSidebar
            districtOptions={districtOptions}
            filterKey={`${initialFilters.skill}-${initialFilters.district}`}
            isLoading={isLoading}
            resultCount={workers.length}
            selectedDistrict={selectedDistrict}
            selectedSkill={selectedSkill}
            serviceOptions={serviceOptions}
            onReset={handleReset}
            onSearch={handleSearch}
            onSelectedDistrictChange={setSelectedDistrict}
            onSelectedSkillChange={setSelectedSkill}
          />
          <WorkersResultsSection
            hasSearched={hasSearched}
            isLoading={isLoading}
            status={status}
            workers={workers}
          />
        </div>
      </div>
    </main>
  );
}
