import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  FileCheck2,
  Filter,
  Phone,
  Search,
  ShieldCheck,
  UserRoundPlus,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HomeFeaturedWorkers } from '@/components/home/home-featured-workers';
import { HomeSearchForm } from '@/components/home/home-search-form';

const approvalSteps = [
  'কর্মী প্রোফাইল তৈরি',
  'NID ও ছবি যাচাই',
  'কাজের জন্য সরাসরি যোগাযোগ',
];

const trustStats = [
  { value: '৬৪', label: 'জেলা কভারেজ' },
  { value: '৳২০', label: 'একটি নম্বর আনলক' },
  { value: '১০', label: '৳১০০ প্যাকে প্রোফাইল' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
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
            <a href="#profiles" className="hover:text-foreground">
              প্রোফাইল
            </a>
            <a href="#process" className="hover:text-foreground">
              যেভাবে কাজ করে
            </a>
            <Link href="/register" className="hover:text-foreground">
              কর্মী হোন
            </Link>
            <Link href="/verify-otp" className="hover:text-foreground">
              লগইন
            </Link>
            <Link href="/admin/login" className="hover:text-foreground">
              অ্যাডমিন
            </Link>
          </nav>
          <Button size="sm" asChild>
            <Link href="/workers">
              <Search />
              সার্চ
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative min-h-[620px] overflow-hidden bg-foreground text-primary-foreground">
        <Image
          src="/brand/hero-worker.jpeg"
          alt="যাচাইকৃত কর্মী সেবা"
          fill
          sizes="100vw"
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.18_0.035_215)_0%,oklch(0.18_0.035_215/0.86)_44%,oklch(0.18_0.035_215/0.28)_100%)]" />
        <div className="relative mx-auto flex min-h-[620px] max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="success" className="mb-5 border-primary/20 bg-primary/15 text-white">
              <ShieldCheck />
              NID যাচাইকৃত স্থানীয় কর্মী
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-6xl">
              কর্মীর প্রোফাইল দেখুন, পছন্দ হলে নম্বর আনলক করুন
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
              আপনার এলাকার প্লাম্বার, ইলেকট্রিশিয়ান, রং মিস্ত্রি বা গৃহসেবা কর্মীর যাচাইকৃত
              প্রোফাইল ব্রাউজ করুন। তথ্য দেখা ফ্রি, যোগাযোগ নম্বর দেখতে ছোট চার্জ।
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#search">
                  <Filter />
                  ফিল্টার দিয়ে খুঁজুন
                </a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/register">
                  <UserRoundPlus />
                  কর্মী হিসেবে যোগ দিন
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {trustStats.map((item) => (
              <div key={item.label} className="border-l border-white/30 pl-4">
                <p className="text-3xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-sm text-white/72">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="search" className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[380px_1fr] lg:px-8">
          <aside className="rounded-lg border bg-background p-5 shadow-sm">
            <div className="mb-5">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <Search className="size-4" />
                প্রোফাইল সার্চ
              </p>
              <h2 className="text-2xl font-bold">সেবা ও লোকেশন দিয়ে কর্মী খুঁজুন</h2>
            </div>
            <HomeSearchForm />
          </aside>

          <div id="profiles">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">নতুন অনুমোদিত প্রোফাইল</p>
                <h2 className="text-2xl font-bold">ব্রাউজ করুন, তারপর সিদ্ধান্ত নিন</h2>
              </div>
              <Button variant="outline" asChild>
                <Link href="/workers">
                  সব প্রোফাইল
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <HomeFeaturedWorkers />
          </div>
        </div>
      </section>

      <section id="process" className="border-b bg-background">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {approvalSteps.map((step, index) => (
            <div key={step} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="mb-4 flex size-11 items-center justify-center rounded-md bg-secondary text-primary">
                {index === 0 ? <UserRoundPlus /> : index === 1 ? <FileCheck2 /> : <Phone />}
              </div>
              <h3 className="font-bold">{step}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {index === 0
                  ? 'কর্মী নিজের সেবা, অভিজ্ঞতা, এলাকা এবং ছবি দিয়ে প্রোফাইল জমা দেয়।'
                  : index === 1
                    ? 'অ্যাডমিন ছবি ও NID দেখে প্রোফাইল যাচাই করে অনুমোদন করেন।'
                    : 'গ্রাহক তথ্য দেখে পছন্দ করলে কম চার্জে ফোন নম্বর আনলক করেন।'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="admin" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-lg border bg-foreground p-6 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">প্রোফাইল দেখা ফ্রি, যোগাযোগ পেইড</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              বায়োডাটার মতো কর্মীর বিস্তারিত দেখা যাবে। নম্বর দেখতে ৳২০ অথবা ১০টি প্রোফাইলের
              জন্য ৳১০০ প্যাক নেওয়া যাবে।
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/workers">
              প্রোফাইল দেখুন
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
