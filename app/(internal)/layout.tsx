import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import PrivateDataProvider from '@/components/PrivateDataProvider';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!await verifySession(token)) redirect('/login');
  const expiresAt = Number(token!.split(':')[0]) * 1000;
  return <PrivateDataProvider expiresAt={expiresAt}>{children}</PrivateDataProvider>;
}
