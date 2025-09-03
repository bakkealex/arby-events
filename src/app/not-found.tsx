"use client";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen flex-grow py-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">404</h1>
      <h2 className="text-center mb-4">This page could not be found!</h2>
      <Link
        href="/"
        className="block w-full sm:w-auto bg-white hover:bg-gray-50 text-blue-600 font-bold py-3 px-8 rounded-lg text-lg border-2 border-blue-600 transition duration-200"
      >
        Go to Home
      </Link>
    </div>
  );
}
