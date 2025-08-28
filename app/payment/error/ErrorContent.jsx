"use client";
import { useSearchParams } from 'next/navigation';

export default function ErrorContent() {
  const searchParams = useSearchParams();
  // ...your error page logic...
  return <div>Error occurred. Please try again.</div>;
}