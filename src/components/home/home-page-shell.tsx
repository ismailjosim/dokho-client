'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  FileCheck2,
  Phone,
  Search,
  ShieldCheck,
  UserRoundPlus,
} from 'lucide-react';

import { HomeSearchForm } from '@/components/home/home-search-form';
import { LanguageSwitcher } from '@/components/site/language-switcher';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';

const copy = {
  bn: {
    navSearch: 'কর্মী খুঁজুন',
    navStats: 'পরিসংখ্যান',
    navProcess: 'যেভাবে কাজ করে',
    navJoin: 'কর্মী হোন',
    login: 'লগইন',
    admin: 'অ্যাডমিন',
    search: 'সার্চ',
    badge: 'বাংলাদেশের যাচাইকৃত কর্মী ডিরেক্টরি',
    headline: 'আপনার নিকটবর্তী এলাকায় দক্ষ কর্মী খোঁজা এখন সহজ',
    subtitle:
      'আপনার এলাকার প্লাম্বার, ইলেকট্রিশিয়ান, রং মিস্ত্রি বা গৃহসেবা কর্মীর যাচাইকৃত প্রোফাইল ব্রাউজ করুন। তথ্য দেখা ফ্রি, যোগাযোগ নম্বর দেখতে ছোট চার্জ।',
    quote: 'প্রোফাইল দেখা সম্পূর্ণ ফ্রি। কাজের জন্য যোগাযোগ করতে চাইলে ছোট চার্জে নম্বর আনলক করুন।',
    createTitle: 'দক্ষে সম্পূর্ণ বিনামূল্যে কর্মী প্রোফাইল তৈরি করা যায়',
    filterCta: 'কর্মী খুঁজুন',
    joinCta: 'কর্মী হিসেবে যোগ দিন',
    stats: [
      { value: '৬৪', label: 'জেলা কভারেজ' },
      { value: '৳২০', label: 'একটি নম্বর আনলক' },
      { value: '১০', label: '৳১০০ প্যাকে প্রোফাইল' },
    ],
    searchEyebrow: 'প্রোফাইল সার্চ',
    searchTitle: 'সেবা ও লোকেশন দিয়ে কর্মী খুঁজুন',
    statsTitle: 'দক্ষ সেবা গ্রহীতার পরিসংখ্যান',
    statCards: [
      { value: '৬৪', label: 'জেলা কভারেজ' },
      { value: '৳২০', label: 'একটি নম্বর আনলক' },
      { value: '৳১০০', label: '১০ প্রোফাইল প্যাক' },
      { value: '৩ ধাপ', label: 'যাচাই প্রক্রিয়া' },
    ],
    processTitle: 'দক্ষ যেভাবে কাজ করে',
    steps: [
      {
        title: 'কর্মী প্রোফাইল তৈরি',
        body: 'কর্মী নিজের সেবা, অভিজ্ঞতা, এলাকা এবং ছবি দিয়ে প্রোফাইল জমা দেয়।',
      },
      {
        title: 'NID ও ছবি যাচাই',
        body: 'অ্যাডমিন ছবি ও NID দেখে প্রোফাইল যাচাই করে অনুমোদন করেন।',
      },
      {
        title: 'কাজের জন্য সরাসরি যোগাযোগ',
        body: 'গ্রাহক তথ্য দেখে পছন্দ করলে কম চার্জে ফোন নম্বর আনলক করেন।',
      },
    ],
    footerTitle: 'প্রোফাইল দেখা ফ্রি, যোগাযোগ পেইড',
    footerBody:
      'বায়োডাটার মতো কর্মীর বিস্তারিত দেখা যাবে। নম্বর দেখতে ৳২০ অথবা ১০টি প্রোফাইলের জন্য ৳১০০ প্যাক নেওয়া যাবে।',
    viewProfiles: 'প্রোফাইল দেখুন',
  },
  en: {
    navSearch: 'Find Workers',
    navStats: 'Stats',
    navProcess: 'How It Works',
    navJoin: 'Join as Worker',
    login: 'Login',
    admin: 'Admin',
    search: 'Search',
    badge: 'Verified worker directory for Bangladesh',
    headline: 'Find skilled workers near your location with confidence',
    subtitle:
      'Find verified plumbers, electricians, painters, carpenters and home-service workers near you. Profile details are free; contact access is paid.',
    quote:
      'Profile browsing is free. Unlock contact numbers with a small charge only when you want to hire.',
    createTitle: 'Create a worker profile on Dokho completely free',
    filterCta: 'Find workers',
    joinCta: 'Join as worker',
    stats: [
      { value: '64', label: 'District coverage' },
      { value: '৳20', label: 'Unlock one contact' },
      { value: '10', label: 'Profiles in ৳100 pack' },
    ],
    searchEyebrow: 'Profile search',
    searchTitle: 'Find workers by service and location',
    statsTitle: 'Dokho service statistics',
    statCards: [
      { value: '64', label: 'District coverage' },
      { value: '৳20', label: 'Unlock one contact' },
      { value: '৳100', label: '10-profile pack' },
      { value: '3 steps', label: 'Verification flow' },
    ],
    processTitle: 'How Dokho works',
    steps: [
      {
        title: 'Create worker profile',
        body: 'Workers submit service, experience, location and profile photos.',
      },
      {
        title: 'NID and photo verification',
        body: 'Admins review NID and uploaded images before public approval.',
      },
      {
        title: 'Contact for work',
        body: 'Customers unlock the phone number with a small charge after reviewing details.',
      },
    ],
    footerTitle: 'Free profile browsing, paid contact access',
    footerBody:
      'Like a biodata directory, worker details are visible first. Unlock one number for ৳20 or buy a ৳100 pack for 10 profiles.',
    viewProfiles: 'View profiles',
  },
};

export function HomePageShell() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Image
            src="/brand/logo-with-text.png"
            alt="দক্ষ"
            width={132}
            height={44}
            priority
            className="h-11 w-auto object-contain"
          />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            <a href="#search" className="hover:text-foreground">
              {text.navSearch}
            </a>
            <a href="#stats" className="hover:text-foreground">
              {text.navStats}
            </a>
            <a href="#process" className="hover:text-foreground">
              {text.navProcess}
            </a>
            <Link href="/register" className="hover:text-foreground">
              {text.navJoin}
            </Link>
            <Link href="/verify-otp" className="hover:text-foreground">
              {text.login}
            </Link>
            <Link href="/admin/login" className="hover:text-foreground">
              {text.admin}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/workers">
                <Search />
                {text.search}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-secondary text-foreground">
        <Image
          src="/brand/hero-worker.jpeg"
          alt="যাচাইকৃত কর্মী সেবা"
          fill
          sizes="100vw"
          className="object-cover opacity-12 dark:opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.92_0.08_340/0.75),transparent_42%),radial-gradient(circle_at_85%_20%,oklch(0.86_0.11_300/0.7),transparent_30%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.35_0.09_320/0.7),transparent_42%),radial-gradient(circle_at_85%_20%,oklch(0.28_0.08_285/0.65),transparent_30%)]" />
        <div className="relative mx-auto flex min-h-[680px] max-w-6xl flex-col items-center justify-center px-4 pb-24 pt-12 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Badge variant="success" className="mb-5">
              <ShieldCheck />
              {text.badge}
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-primary sm:text-6xl">
              {text.headline}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              {text.subtitle}
            </p>
            <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-primary/25 bg-card/70 p-5 text-sm leading-7 shadow-sm backdrop-blur">
              {text.quote}
            </div>
          </div>
        </div>
      </section>

      <section id="search" className="relative z-10 -mt-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-lg border bg-card p-5 shadow-xl shadow-primary/10">
          <div className="mb-5 grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <Search className="size-4" />
                {text.searchEyebrow}
              </p>
              <h2 className="text-2xl font-bold">{text.searchTitle}</h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/workers">
                {text.filterCta}
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <HomeSearchForm />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold leading-tight text-primary sm:text-4xl">
          {text.createTitle}
        </h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
          <Button
            size="lg"
            asChild
            className="h-14 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/register">
              <UserRoundPlus />
              {text.joinCta}
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="h-14">
            <Link href="/workers">
              <Search />
              {text.filterCta}
            </Link>
          </Button>
        </div>
      </section>

      <section id="stats" className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold leading-tight text-primary sm:text-4xl">
          {text.statsTitle}
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {text.statCards.map((stat, index) => (
            <div key={stat.label} className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border bg-secondary text-primary">
                {index === 0 ? (
                  <BriefcaseBusiness className="size-8" />
                ) : index === 1 ? (
                  <Phone className="size-8" />
                ) : index === 2 ? (
                  <BarChart3 className="size-8" />
                ) : (
                  <BadgeCheck className="size-8" />
                )}
              </div>
              <p className="text-4xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="process" className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold leading-tight text-primary sm:text-4xl">
          {text.processTitle}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {text.steps.map((step, index) => (
            <div key={step.title} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-md bg-secondary text-primary">
                {index === 0 ? <UserRoundPlus /> : index === 1 ? <FileCheck2 /> : <Phone />}
              </div>
              <h3 className="font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="admin" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-lg border bg-primary p-6 text-primary-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{text.footerTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/80">
              {text.footerBody}
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/workers">
              {text.viewProfiles}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
