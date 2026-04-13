import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">
          Last updated: March 4, 2026
        </p>

        <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              1. Information We Collect
            </h2>
            <p>
              When you create an account, we collect your name, email address,
              and password. We also collect usage data such as reading progress,
              library items, and reviews you submit. Technical data like browser
              type and IP address may be collected automatically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to provide and improve the Boi Pora
              service, including personalizing your reading experience, managing
              your account, and communicating with you about updates and changes
              to the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              3. Data Storage and Security
            </h2>
            <p>
              Your data is stored securely using industry-standard practices. We
              use encryption for sensitive information and regularly review our
              security measures. However, no method of transmission over the
              internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              4. Cookies and Local Storage
            </h2>
            <p>
              We use local storage to save your authentication token, theme
              preference, and reading settings. These are essential for the
              platform to function properly and provide a personalized
              experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              5. Third-Party Services
            </h2>
            <p>
              We do not sell, trade, or share your personal information with
              third parties for marketing purposes. We may use third-party
              services for hosting and analytics, which are bound by their own
              privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              6. Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your personal
              information at any time through your account settings. You may also
              request a copy of your data or ask us to delete your account
              entirely by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              7. Children&apos;s Privacy
            </h2>
            <p>
              Boi Pora is not directed at children under the age of 13. We do
              not knowingly collect personal information from children. If you
              believe we have collected such information, please contact us and
              we will take steps to remove it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of any significant changes by posting the new policy on this
              page. Continued use of the platform constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              9. Contact
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please reach
              out through our{" "}
              <Link
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
