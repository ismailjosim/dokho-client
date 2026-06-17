'use client';

import { Languages } from 'lucide-react';

import { useLanguage, type Language } from '@/lib/language';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-semibold">
      <Languages className="size-4 text-primary" />
      <select
        aria-label="Change language"
        className="bg-transparent outline-none"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
      >
        <option value="bn">বাংলা</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
