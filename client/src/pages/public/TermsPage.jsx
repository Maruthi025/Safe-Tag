export default function TermsPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto card p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-xs mb-8">Effective Date: {new Date().toLocaleDateString()}</p>
        <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. Terms of Use</h2>
            <p>By using Safe Tag, you agree to submit truthful, accurate reports and respect user privacy.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. Matching Disclaimer</h2>
            <p>Safe Tag match scores are heuristic estimates and do not constitute legal proof of item ownership. Owners are responsible for verifying item identity.</p>
          </section>
        </div>
      </div>
    </div>
  )
}