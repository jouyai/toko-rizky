import { Suspense } from "react";
import FinishContent from "./FinishContent";

export default function PaymentFinishPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Memuat…</div>}>
      <FinishContent />
    </Suspense>
  );
}
