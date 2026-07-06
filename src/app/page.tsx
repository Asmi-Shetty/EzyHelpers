import dynamic from 'next/dynamic';
const GeoSmartApp = dynamic(() => import('@/components/GeoSmartApp'), { ssr: false, loading: () => <main className="loading">Loading Bangalore locality intelligence…</main> });
export default function Home() { return <GeoSmartApp />; }
