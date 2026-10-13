import { daily, groups, summary } from '@/lib/server/reports';
import { SPPG_SEED } from '@/lib/server/sppg';
import ReportClient from './ReportClient';
export const metadata = { title: 'Laporan Oktober & penerima manfaat', robots: { index: false, follow: false } };
export default function Reports() {
  return <ReportClient daily={daily} groups={groups} summary={summary} kitchens={SPPG_SEED.map(s => ({id:s.id,nama:s.nama}))} />;
}
