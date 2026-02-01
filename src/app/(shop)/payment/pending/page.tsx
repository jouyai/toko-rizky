import { Suspense } from "react";
import PendingContent from "./PendingContent";

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Memuat…</div>}>
      <PendingContent />
    </Suspense>
  );
}
