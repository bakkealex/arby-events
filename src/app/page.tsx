import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { config } from "@/lib/config";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {config.app.name}
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {config.org.tagline}
          </p>

          {session ? (
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                href="/dashboard"
                className="block w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/groups"
                className="block w-full sm:w-auto bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold py-3 px-8 rounded-lg text-lg border-2 border-blue-600 dark:border-blue-400 transition duration-200"
              >
                Browse Groups
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                href="/auth/signup"
                className="block w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
              >
                Get Started
              </Link>
              <Link
                href="/auth/signin"
                className="block w-full sm:w-auto bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold py-3 px-8 rounded-lg text-lg border-2 border-blue-600 dark:border-blue-400 transition duration-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">
              👥
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Join Groups
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with like-minded people and join groups that interest you.
              Request to join or get invited by group administrators.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">
              📅
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Subscribe to Events
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Never miss an event! Subscribe to events you&apos;re interested in
              and download calendar files to sync with your favorite calendar
              app.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">
              📧
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Email Notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get notified via email when new events are added to your groups or
              when subscribed events are updated or changed.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
