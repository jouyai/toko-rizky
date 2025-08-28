import { Suspense } from "react";
import ErrorContent from "./ErrorContent";

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Memuat…</div>}>
      <ErrorContent />
    </Suspense>
  );
}
