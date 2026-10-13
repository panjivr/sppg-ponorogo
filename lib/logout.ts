import { clearPrivateData } from '@/lib/storage';
export async function logout() {
  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (response.ok) { clearPrivateData(); window.location.replace('/login'); }
}
