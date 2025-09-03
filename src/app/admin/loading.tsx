"use client";
import AdminHeader from "@/components/admin/shared/AdminHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

// Breadcrumbs
const breadcrumbs = [{ label: "Admin Dashboard", current: true }];

export default function Loading() {
  return (
    <>
      <AdminHeader title="Loading..." breadcrumbs={breadcrumbs} />
      <div className="flex flex-col justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    </>
  );
}
