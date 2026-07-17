import Link from 'next/link';
import { BadgeCheck, BriefcaseBusiness, Eye, Hammer, MapPin, Phone, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type WorkerResult = {
  id: string;
  skill: string;
  district: string;
  upazila?: string | null;
  area?: string | null;
  profilePhotoUrl?: string | null;
  experienceYears: number;
  availability: 'AVAILABLE' | 'NOT_AVAILABLE';
  user: {
    name: string;
    maskedPhone?: string | null;
  };
};

type WorkerResultCardProps = {
  worker: WorkerResult;
  /** Zero-based index for staggered entrance animation */
  index?: number;
};

function getWorkerLocation(worker: WorkerResult) {
  return [worker.area, worker.upazila, worker.district].filter(Boolean).join(', ');
}

export function WorkerResultCard({ worker, index = 0 }: WorkerResultCardProps) {
  const isAvailable = worker.availability === 'AVAILABLE';
  const initial = worker.user.name.trim().charAt(0) || 'ক';
  const maskedPhone = worker.user.maskedPhone;

  return (
    <article
      className="animate-card-enter overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="grid gap-0 sm:grid-cols-[120px_1fr]">
        {/* ---------- Photo / Avatar ---------- */}
        <div className="flex min-h-36 items-center justify-center bg-muted sm:min-h-full">
          <div className="flex h-full min-h-36 w-full items-center justify-center overflow-hidden sm:min-h-full">
            {worker.profilePhotoUrl ? (
              <div
                aria-label={`${worker.user.name} এর প্রোফাইল ছবি`}
                className="h-full w-full bg-cover bg-center"
                role="img"
                style={{ backgroundImage: `url(${worker.profilePhotoUrl})` }}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                <UserRound className="size-7" />
                <span className="text-lg font-bold">{initial}</span>
              </div>
            )}
          </div>
        </div>

        {/* ---------- Card Body ---------- */}
        <div className="flex min-w-0 flex-col justify-between p-4">
          <div>
            {/* Badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="success">
                <BadgeCheck />
                ভেরিফাইড
              </Badge>
              <Badge variant="secondary">
                <Hammer />
                {worker.skill}
              </Badge>
              <Badge variant={isAvailable ? 'success' : 'outline'}>
                <BriefcaseBusiness />
                {isAvailable ? 'কাজ নিতে পারবেন' : 'এখন ব্যস্ত'}
              </Badge>
            </div>

            {/* Name */}
            <h2 className="break-words text-xl font-bold leading-7">{worker.user.name}</h2>

            {/* Details grid */}
            <dl className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
              <div className="flex min-w-0 items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <dd className="min-w-0 break-words">{getWorkerLocation(worker)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Hammer className="size-4 shrink-0 text-primary" />
                <dd>অভিজ্ঞতা {worker.experienceYears} বছর</dd>
              </div>
              {maskedPhone ? (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Phone className="size-4 shrink-0 text-primary" />
                  <dd className="font-medium tracking-wide">{maskedPhone}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          {/* CTA buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
            <Button asChild variant="outline" className="min-h-[44px] w-full sm:w-auto">
              <Link
                href={`/workers/${worker.id}`}
                aria-label={`${worker.user.name} এর প্রোফাইল দেখুন`}
              >
                <Eye />
                বিস্তারিত
              </Link>
            </Button>
            <Button asChild className="min-h-[44px] w-full sm:w-auto">
              <Link
                href={`/workers/${worker.id}`}
                aria-label={`${worker.user.name} এর যোগাযোগ নম্বর দেখুন`}
              >
                <Phone />
                যোগাযোগ করুন
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
