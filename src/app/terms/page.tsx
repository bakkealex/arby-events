import { config } from "@/lib/config";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Terms and Conditions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  By accessing and using {config.app.name}, you accept and agree
                  to be bound by the terms and provision of this agreement.
                  These Terms and Conditions govern your use of this service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Account Registration
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>To access our services, you must:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Provide accurate and complete registration information
                  </li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept our Privacy Policy and data processing terms</li>
                  <li>
                    Wait for administrator approval before accessing the
                    platform
                  </li>
                  <li>Be at least 16 years old or have parental consent</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. User Responsibilities
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>As a user of our platform, you agree to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Use the service only for lawful purposes</li>
                  <li>Respect other users and maintain professional conduct</li>
                  <li>
                    Not share inappropriate, offensive, or harmful content
                  </li>
                  <li>Not attempt to gain unauthorized access to the system</li>
                  <li>Report any security vulnerabilities or misuse</li>
                  <li>Keep your contact information up to date</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Content and Intellectual Property
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>Regarding content and intellectual property:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>You retain ownership of content you create</li>
                  <li>
                    You grant us license to display and process your content for
                    service provision
                  </li>
                  <li>
                    You must not infringe on others&apos; intellectual property
                    rights
                  </li>
                  <li>
                    Our platform and its original content remain our property
                  </li>
                  <li>We may remove content that violates these terms</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Privacy and Data Protection
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  Our privacy practices are governed by our Privacy Policy,
                  which includes:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>GDPR compliance for European users</li>
                  <li>Transparent data collection and processing</li>
                  <li>Your rights to access, modify, and delete your data</li>
                  <li>Secure data storage and transmission</li>
                  <li>
                    Limited data sharing only as specified in our Privacy Policy
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Group and Event Management
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>For group and event features:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Only administrators can create new groups</li>
                  <li>
                    Group administrators have management authority within their
                    groups
                  </li>
                  <li>
                    Users can request to join groups and subscribe to events
                  </li>
                  <li>Event information must be accurate and appropriate</li>
                  <li>
                    We reserve the right to remove inappropriate groups or
                    events
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Account Termination
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>Account termination may occur if:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>You violate these Terms and Conditions</li>
                  <li>Your account remains inactive for an extended period</li>
                  <li>You request account deletion</li>
                  <li>We discontinue the service (with appropriate notice)</li>
                </ul>
                <p>
                  Upon termination, your data will be handled according to our
                  Privacy Policy and GDPR requirements.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Limitation of Liability
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  {config.org.name} provides this service &quot;as is&quot; without
                  warranties. We are not liable for:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Service interruptions or technical issues</li>
                  <li>Data loss due to user error or external factors</li>
                  <li>Actions or content of other users</li>
                  <li>Third-party integrations or external links</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Governing Law
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  These terms are governed by European Union law and GDPR
                  regulations. Any disputes will be resolved through appropriate
                  legal channels in accordance with applicable data protection
                  and consumer rights laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Changes to Terms
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  We may update these Terms and Conditions. We will notify users
                  of significant changes through:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Email notification to all users</li>
                  <li>Prominent notice on the platform</li>
                  <li>Updated &quot;Last modified&quot; date on this page</li>
                </ul>
                <p>
                  Continued use of the service after changes constitutes
                  acceptance of new terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Contact Information
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  For questions about these Terms and Conditions, contact us:
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> {config.contact.admin}
                  </p>
                  <p>
                    <strong>Organization:</strong> {config.org.name}
                  </p>
                  {config.contact.phone && (
                    <p>
                      <strong>Phone:</strong> {config.contact.phone}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <a
                href="/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← View Privacy Policy
              </a>
              <a
                href="/auth/signup"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to Registration →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
