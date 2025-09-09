"use client";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen flex-grow py-8 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4">404</h1>
      <h2 className="text-center mb-4">This page could not be found!</h2>
      <Link
        href="/"
        className="block sm:w-auto btn btn-primary"
      >
        Go to Home
      </Link>
    </div>
  );
}
