import { config } from "@/lib/config";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Information We Collect
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  When you register for {config.app.name}, we collect the
                  following personal information:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Personal Information:</strong> Name, email address
                  </li>
                  <li>
                    <strong>Account Information:</strong> Password (encrypted),
                    account preferences
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Group memberships, event
                    subscriptions, activity logs
                  </li>
                  <li>
                    <strong>Communication Data:</strong> Messages sent through
                    the platform
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. How We Use Your Information
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  We use your personal information for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To notify you about events and group activities</li>
                  <li>To communicate with you about your account</li>
                  <li>To improve our service and user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. GDPR Compliance
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  As a service provider in the European market, we are committed
                  to compliance with the General Data Protection Regulation
                  (GDPR). You have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Right to Access:</strong> Request copies of your
                    personal data
                  </li>
                  <li>
                    <strong>Right to Rectification:</strong> Request correction
                    of inaccurate data
                  </li>
                  <li>
                    <strong>Right to Erasure:</strong> Request deletion of your
                    personal data
                  </li>
                  <li>
                    <strong>Right to Restrict Processing:</strong> Request
                    limitation of data processing
                  </li>
                  <li>
                    <strong>Right to Data Portability:</strong> Request transfer
                    of your data
                  </li>
                  <li>
                    <strong>Right to Object:</strong> Object to processing of
                    your personal data
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Data Sharing
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information only in the
                  following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements</li>
                  <li>To protect our rights and safety</li>
                  <li>In case of business transfer (with prior notice)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your personal data:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Regular backups and disaster recovery</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibent text-gray-900 dark:text-white mb-4">
                6. Data Retention
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  We retain your personal data only as long as necessary for the
                  purposes outlined in this policy:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Account data: Until account deletion</li>
                  <li>Event data: 7 years for record keeping</li>
                  <li>Communication logs: 2 years</li>
                  <li>Usage analytics: 1 year (anonymized)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Contact Information
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  For questions about this Privacy Policy or to exercise your
                  rights, contact us:
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> {config.contact.support}
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

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Changes to This Policy
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Posting the new Privacy Policy on this page</li>
                  <li>Updating the &quot;Last updated&quot; date</li>
                  <li>Sending email notification for significant changes</li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <a
                href="/auth/signup"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to Registration
              </a>
              <a
                href="/terms"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Terms and Conditions →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
