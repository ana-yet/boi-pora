export default function TermsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">
          Last updated: March 4, 2026
        </p>

        <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Boi Pora, you agree to be bound by these
              Terms of Service and all applicable laws and regulations. If you do
              not agree with any of these terms, you are prohibited from using or
              accessing this platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              2. User Accounts
            </h2>
            <p>
              When you create an account with us, you must provide accurate and
              complete information. You are responsible for safeguarding your
              password and for all activities that occur under your account. You
              agree to notify us immediately of any unauthorized use of your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              3. Content and Intellectual Property
            </h2>
            <p>
              All books, text, graphics, and other content available on Boi Pora
              are the property of their respective authors and publishers. You
              may not reproduce, distribute, or create derivative works from any
              content without proper authorization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              4. User Conduct
            </h2>
            <p>
              You agree not to use the platform to post reviews or content that
              is abusive, defamatory, or violates the rights of others. We
              reserve the right to remove any content and suspend accounts that
              violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              5. Service Availability
            </h2>
            <p>
              We strive to keep Boi Pora available at all times, but we do not
              guarantee uninterrupted access. We may modify, suspend, or
              discontinue any part of the service at any time without prior
              notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              6. Limitation of Liability
            </h2>
            <p>
              Boi Pora and its operators shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use
              of the platform. Our total liability shall not exceed the amount
              you have paid to us in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              7. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. Continued
              use of the platform after changes constitutes acceptance of the
              updated terms. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              8. Contact
            </h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us through our{" "}
              <a
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                contact page
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
