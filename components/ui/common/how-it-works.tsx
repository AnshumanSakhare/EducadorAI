export default function HowItWorksSection() {
  return (
    <section className="relative mx-auto max-w-6xl grid gap-6 px-4 py-16 md:grid-cols-3">
      <div className="w-full bg-white/95 dark:bg-white/5 rounded-3xl py-12 px-8 shadow-lg shadow-rose-500/5 border border-rose-500/80 dark:border-rose-400/80 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-rose-500/20">
        <span className="text-4xl">📄</span>
        <h2 className="font-bold text-xl text-gray-900 dark:text-white">
          Easy Uploads
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Upload any university PDF and get started instantly.
        </p>
      </div>
      <div className="w-full bg-white/95 dark:bg-white/5 rounded-3xl py-12 px-8 shadow-lg shadow-rose-500/5 border border-rose-500/80 dark:border-rose-400/80 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-rose-500/20">
        <span className="text-4xl">🧠</span>
        <h2 className="font-bold text-xl text-gray-900 dark:text-white">
          Smart Summaries
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          AI turns dense PDFs into concise, student‑friendly notes in seconds.
        </p>
      </div>
      <div className="w-full bg-white/95 dark:bg-white/5 rounded-3xl py-12 px-8 shadow-lg shadow-rose-500/5 border border-rose-500/80 dark:border-rose-400/80 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-rose-500/20">
        <span className="text-4xl">❓</span>
        <h2 className="font-bold text-xl text-gray-900 dark:text-white">
          Questions & Answers
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Instantly generate exam‑style questions and clear explanations.
        </p>
      </div>
    </section>
  );
}