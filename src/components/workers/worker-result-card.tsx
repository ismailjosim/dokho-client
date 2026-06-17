import { BadgeCheck, BriefcaseBusiness, Hammer, MapPin, Phone } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type WorkerResult = {
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

type WorkerResultCardProps = {
  worker: WorkerResult;
};

function getWorkerLocation(worker: WorkerResult) {
  return [worker.area, worker.upazila, worker.district].filter(Boolean).join(', ');
}

export function WorkerResultCard({ worker }: WorkerResultCardProps) {
  const isAvailable = worker.availability === 'AVAILABLE';

  return (
    <article className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

        <Button asChild className="w-full sm:w-auto">
          <a href={`tel:${worker.user.phone}`} aria-label={`${worker.user.name} কে কল করুন`}>
            <Phone />
            কল করুন
          </a>
        </Button>
      </div>
    </article>
  );
}
