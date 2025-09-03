"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { config } from "@/lib/config";

export default function PageHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {config.app.brandName}
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {status === "loading" ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : session ? (
              <>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <nav className="flex items-center space-x-2 mr-2">
                  <Link
                    href="/dashboard"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition
                        dark:text-gray-300 dark:hover:text-white"
                  >
                    Dashboard
                  </Link>
                  {/* Only show Admin link for admin users */}
                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition
                          dark:text-gray-300 dark:hover:text-white"
                    >
                      Admin
                    </Link>
                  )}
                </nav>
                <Link
                  href="/api/auth/signout"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition
                      dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium
                      dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium
                      dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
