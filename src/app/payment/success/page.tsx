import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PaymentSuccessPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const paymentId =
    (Array.isArray(searchParams?.id) ? searchParams?.id[0] : searchParams?.id) ||
    (Array.isArray(searchParams?.payment_id) ? searchParams?.payment_id[0] : searchParams?.payment_id) ||
    "N/A";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. We have received your payment.
        </p>
        
        <div className="bg-gray-50 p-3 rounded-lg mb-6 text-sm">
          <span className="text-gray-500">Transaction ID:</span>
          <br />
          <span className="font-mono font-medium text-gray-800">{paymentId}</span>
        </div>

        <Link 
          href="/"
          className="inline-block w-full px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}