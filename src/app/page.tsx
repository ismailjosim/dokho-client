import Image from 'next/image';
import {
  ArrowRight,
  BadgeCheck,
  Hammer,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserRoundPlus,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bn } from '@/lib/bengali';

const skills = ['প্লাম্বার', 'ইলেকট্রিশিয়ান', 'রং মিস্ত্রি', 'কাঠ মিস্ত্রি'];
const districts = ['ঢাকা', 'রাজশাহী', 'চট্টগ্রাম', 'সিলেট', 'খুলনা'];

const workers = [
  {
    name: 'মো. রফিকুল ইসলাম',
    skill: 'প্লাম্বার',
    area: 'মিরপুর, ঢাকা',
    experience: '৮ বছর',
    phone: '01710-000000',
    image: '/brand/plumber.jpeg',
  },
  {
    name: 'সোহেল রানা',
    skill: 'ইলেকট্রিশিয়ান',
    area: 'বোয়ালিয়া, রাজশাহী',
    experience: '৬ বছর',
    phone: '01820-000000',
    image: '/brand/electrician.jpeg',
  },
];

const approvalSteps = [
  'ওটিপি দিয়ে রেজিস্ট্রেশন',
  'কর্মীর প্রোফাইল জমা',
  'অ্যাডমিন যাচাই ও অনুমোদন',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Image
            src="/brand/logo-with-text.png"
            alt="দক্ষ"
            width={132}
            height={44}
            priority
            className="h-11 w-auto object-contain"
          />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#search" className="hover:text-foreground">
              কর্মী খুঁজুন
            </a>
            <a href="/register" className="hover:text-foreground">
              কর্মী হোন
            </a>
            <a href="/admin/login" className="hover:text-foreground">
              অ্যাডমিন
            </a>
          </nav>
          <Button size="sm">
            <Phone />
            কল করুন
          </Button>
        </div>
      </header>

      <section className="bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-10">
          <div className="flex flex-col justify-center">
            <Badge variant="success" className="mb-4">
              <ShieldCheck />
              যাচাইকৃত স্থানীয় কর্মী
            </Badge>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              আপনার এলাকার দক্ষ কর্মী খুঁজুন, সরাসরি কল করুন
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
              প্লাম্বার, ইলেকট্রিশিয়ান, রং মিস্ত্রি বা কাঠ মিস্ত্রি খুঁজতে সহজ বাংলা মোবাইল-ফার্স্ট
              ডিরেক্টরি।
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="/workers">
                  <Search />
                  এখনই খুঁজুন
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/register">
                  <UserRoundPlus />
                  কর্মী হিসেবে যোগ দিন
                </a>
              </Button>
            </div>
          </div>
          <div className="relative min-h-75 overflow-hidden rounded-lg border bg-muted">
            <Image
              src="/brand/hero-worker.jpeg"
              alt="কর্মী ও গ্রাহকের করমর্দন"
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section id="search" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Search className="size-5 text-primary" />
              <h2 className="text-xl font-bold">কর্মী খুঁজুন</h2>
            </div>
            <form action="/workers" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skill">{bn.field.skill}</Label>
                <select
                  id="skill"
                  name="skill"
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="প্লাম্বার"
                >
                  {skills.map((skill) => (
                    <option key={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">{bn.field.district}</Label>
                <select
                  id="district"
                  name="district"
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="ঢাকা"
                >
                  {districts.map((district) => (
                    <option key={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">{bn.field.area}</Label>
                <Input id="area" placeholder="যেমন: মিরপুর ১০" />
              </div>
              <Button className="w-full">
                <Search />
                {bn.action.viewResults}
              </Button>
            </form>
          </aside>

          <div className="space-y-4">
            {workers.map((worker) => (
              <article
                key={worker.phone}
                className="grid gap-4 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-[132px_1fr_auto]"
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-md bg-muted sm:aspect-square">
                  <Image
                    src={worker.image}
                    alt={worker.skill}
                    fill
                    sizes="132px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="success">
                      <BadgeCheck />
                      অনুমোদিত
                    </Badge>
                    <Badge variant="secondary">{worker.skill}</Badge>
                  </div>
                  <h3 className="text-xl font-bold">{worker.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" />
                      {worker.area}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Hammer className="size-4" />
                      অভিজ্ঞতা {worker.experience}
                    </span>
                  </div>
                </div>
                <div className="flex items-center sm:justify-end">
                  <Button asChild>
                    <a href={`tel:${worker.phone}`}>
                      <Phone />
                      কল করুন
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="join" className="border-y bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {approvalSteps.map((step, index) => (
            <div key={step} className="rounded-lg border bg-background p-5">
              <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </div>
              <h3 className="font-bold">{step}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                সহজ ফর্ম, বড় ইনপুট, এবং মোবাইল-ফার্স্ট যাচাই প্রক্রিয়া।
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="admin" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-lg border bg-primary p-6 text-primary-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">অ্যাডমিন অনুমোদন আগে, পাবলিক লিস্টিং পরে</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/85">
              GraphQL API দিয়ে worker profile, approval status, search filter, এবং RBAC একই schema
              থেকে নিয়ন্ত্রণ করা হবে।
            </p>
          </div>
          <Button variant="secondary" size="lg" asChild>
            <a href="/admin/login">
              ড্যাশবোর্ড লগইন
              <ArrowRight />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
