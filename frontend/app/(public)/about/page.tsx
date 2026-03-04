export default function AboutPage() {
  const stats = [
    { icon: "auto_stories", label: "Books", value: "500+" },
    { icon: "people", label: "Readers", value: "10,000+" },
    { icon: "star", label: "Reviews", value: "25,000+" },
    { icon: "category", label: "Categories", value: "20+" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <section className="max-w-3xl mx-auto text-center mb-20">
        <span className="material-icons text-5xl text-primary mb-4">
          auto_stories
        </span>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
          About Boi Pora
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Boi Pora is a digital reading platform dedicated to making books
          accessible to everyone. Our mission is to foster a love of reading by
          providing a curated library of books in multiple languages, with a
          seamless reading experience across all devices.
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="text-center p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark"
          >
            <span className="material-icons text-3xl text-primary mb-3">
              {stat.icon}
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto mb-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Our Mission
        </h2>
        <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            We believe that reading has the power to transform lives. Boi Pora
            was built to break down the barriers between readers and the books
            they love — whether those barriers are language, cost, or access.
          </p>
          <p>
            Our platform offers a rich collection of books across genres like
            fiction, non-fiction, poetry, and more. Readers can explore,
            bookmark, review, and track their reading progress all in one place.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto mb-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          What We Offer
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              icon: "search",
              title: "Discover",
              desc: "Browse a curated collection of books across genres and languages.",
            },
            {
              icon: "bookmark",
              title: "Library",
              desc: "Save books to your personal library and pick up where you left off.",
            },
            {
              icon: "rate_review",
              title: "Reviews",
              desc: "Share your thoughts and read reviews from fellow readers.",
            },
            {
              icon: "devices",
              title: "Read Anywhere",
              desc: "Enjoy a comfortable reading experience on any device, any time.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark"
            >
              <span className="material-icons text-2xl text-primary mt-0.5">
                {item.icon}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Built With
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Boi Pora is built with modern web technologies including Next.js,
          NestJS, MongoDB, and Tailwind CSS — designed for speed, reliability,
          and a great user experience.
        </p>
      </section>
    </div>
  );
}
