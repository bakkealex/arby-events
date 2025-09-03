"use client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}
