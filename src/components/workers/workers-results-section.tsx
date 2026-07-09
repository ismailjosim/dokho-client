import { AlertCircle, Loader2, SearchX } from 'lucide-react';

import { WorkerResultCard, type WorkerResult } from '@/components/workers/worker-result-card';

type WorkersResultsSectionProps = {
  hasSearched: boolean;
  isLoading: boolean;
  status: string;
  workers: WorkerResult[];
};

export function WorkersResultsSection({
  hasSearched,
  isLoading,
  status,
  workers,
}: WorkersResultsSectionProps) {
  return (
    <section>
      <div className="mb-5 text-center">
        <h2 className="text-3xl font-bold text-primary">কর্মী প্রোফাইল সমূহ</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading ? 'লোড হচ্ছে...' : `${workers.length}টি প্রোফাইল পাওয়া গেছে`}
        </p>
      </div>

      {status ? (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-muted p-3 text-sm">
          {hasSearched ? (
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          ) : null}
          <p>{status}</p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
          <Loader2 className="mx-auto mb-3 size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">ভেরিফাইড কর্মীদের তালিকা খোঁজা হচ্ছে...</p>
        </div>
      ) : null}

      {!isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {workers.map((worker) => (
            <WorkerResultCard key={worker.id} worker={worker} />
          ))}
        </div>
      ) : null}

      {hasSearched && !isLoading && !status && workers.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
          <SearchX className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="text-lg font-bold">কোনো ভেরিফাইড কর্মী পাওয়া যায়নি</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            সেবা বা জেলার নাম একটু পরিবর্তন করে আবার খুঁজে দেখুন।
          </p>
        </div>
      ) : null}
    </section>
  );
}
