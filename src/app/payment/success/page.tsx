import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Memuat…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
