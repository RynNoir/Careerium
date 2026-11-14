import { Suspense } from "react";
import { DetailView } from "./detail-view";

// id dibaca di klien (useParams) di dalam Suspense: data riwayat hanya untuk pemilik (cookie), tidak di-prerender.
export default function RiwayatDetailPage() {
  return (
    <Suspense fallback={<div className="skeleton h-40" aria-busy="true" />}>
      <DetailView />
    </Suspense>
  );
}
