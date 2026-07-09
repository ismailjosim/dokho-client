import Link from 'next/link';
import { ArrowLeft, Filter } from 'lucide-react';

import { LanguageSwitcher } from '@/components/site/language-switcher';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { Button } from '@/components/ui/button';

export function WorkersPageHeader() {
  return (
    <section className="border-b bg-secondary text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="secondary" asChild className="w-fit">
            <Link href="/">
              <ArrowLeft />
              হোমে ফিরুন
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
            <Filter className="size-4" />
            কর্মী প্রোফাইল ডিরেক্টরি
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            সেবা, জেলা ও অভিজ্ঞতা দেখে যাচাইকৃত কর্মী বাছাই করুন
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            প্রোফাইল দেখা ফ্রি। পছন্দ হলে পেমেন্ট ক্রেডিট ব্যবহার করে ফোন নম্বর আনলক করুন।
          </p>
        </div>
      </div>
    </section>
  );
}
