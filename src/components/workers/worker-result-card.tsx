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
};

function getWorkerLocation(worker: WorkerResult) {
  return [worker.area, worker.upazila, worker.district].filter(Boolean).join(', ');
}

export function WorkerResultCard({ worker }: WorkerResultCardProps) {
  const isAvailable = worker.availability === 'AVAILABLE';
  const initial = worker.user.name.trim().charAt(0) || 'ক';

  return (
    <article className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
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

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="success">
                <BadgeCheck />
                অনুমোদিত
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

            <h2 className="break-words text-xl font-bold leading-7">{worker.user.name}</h2>

            <dl className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
              <div className="flex min-w-0 items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <dd className="min-w-0 break-words">{getWorkerLocation(worker)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Hammer className="size-4 shrink-0 text-primary" />
                <dd>অভিজ্ঞতা {worker.experienceYears} বছর</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="grid gap-2 sm:w-auto">
          <div className="flex items-center justify-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
            <Phone className="size-4 text-primary" />
            {worker.user.maskedPhone || 'ফোন নম্বর নিরাপদে রাখা হয়েছে'}
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/workers/${worker.id}`} aria-label={`${worker.user.name} এর প্রোফাইল দেখুন`}>
              <Eye />
              বিস্তারিত দেখুন
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
