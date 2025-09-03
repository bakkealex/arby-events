import { config, getFullCopyrightText } from "@/lib/config";

export default function PageFooter() {
  return (
    <footer className="bg-white dark:bg-gray-900 p-4 text-center w-full mt-auto border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getFullCopyrightText()}
        </div>
        <div className="flex space-x-4 text-sm">
          {config.legal.privacyPolicyUrl && (
            <a
              href={config.legal.privacyPolicyUrl}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Privacy Policy
            </a>
          )}
          {config.legal.termsOfServiceUrl && (
            <a
              href={config.legal.termsOfServiceUrl}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Terms of Service
            </a>
          )}
          {config.contact.support && (
            <a
              href={`mailto:${config.contact.support}`}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Support
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
