'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bn } from '@/lib/bengali';
import { authTokenStorage, graphqlRequest } from '@/services/graphql/client';

const ADMIN_LOGIN = /* GraphQL */ `
  mutation AdminLogin($phone: String!, $password: String!) {
    adminLogin(phone: $phone, password: $password) {
      accessToken
      user {
        id
        name
        role
      }
    }
  }
`;

export default function AdminLoginPage() {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(event.currentTarget);

    try {
      const result = await graphqlRequest<{
        adminLogin: { accessToken: string; user: { name: string } };
      }>(ADMIN_LOGIN, {
        phone: String(formData.get('phone') || ''),
        password: String(formData.get('password') || ''),
      });

      authTokenStorage.set(result.adminLogin.accessToken);
      setStatus(`${result.adminLogin.user.name} অ্যাডমিন হিসেবে লগইন করেছেন।`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'অ্যাডমিন লগইন ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <Button variant="ghost" asChild className="mb-6 w-fit px-0">
        <Link href="/">
          <ArrowLeft />
          {bn.nav.home}
        </Link>
      </Button>
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h1 className="text-2xl font-bold">অ্যাডমিন {bn.action.login}</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="phone">{bn.field.phone}</Label>
            <Input id="phone" name="phone" required placeholder="01XXXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{bn.field.password}</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
          <Button className="w-full" disabled={isSubmitting}>
            {bn.action.login}
          </Button>
        </form>
        {status ? <p className="mt-4 rounded-md bg-muted p-3 text-sm">{status}</p> : null}
        <Button variant="link" asChild className="mt-3 px-0">
          <Link href="/admin/dashboard">{bn.nav.dashboard}</Link>
        </Button>
      </div>
    </main>
  );
}
