import { AlertCircle, Loader2, SearchX, UserSearch } from 'lucide-react';

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
          {isLoading ? 'লোড হচ্ছে...' : `${workers.length}টি প্রোফাইল পাওয়া গেছে`}
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
          {workers.map((worker, index) => (
            <WorkerResultCard key={worker.id} worker={worker} index={index} />
          ))}
        </div>
      ) : null}

      {hasSearched && !isLoading && !status && workers.length === 0 ? (
        <div className="animate-card-enter rounded-xl border bg-card p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <UserSearch className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">কোনো ভেরিফাইড কর্মী পাওয়া যায়নি</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            আপনার নির্বাচিত সেবা বা জেলায় এখনো কোনো যাচাইকৃত কর্মী নেই। সেবা বা জেলার নাম একটু
            পরিবর্তন করে আবার খুঁজে দেখুন, অথবা &ldquo;ফিল্টার মুছুন&rdquo; চাপুন।
          </p>
          <div className="mx-auto mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <SearchX className="size-4" />
            <span>অন্য সেবা বা এলাকা দিয়ে আবার চেষ্টা করুন</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
