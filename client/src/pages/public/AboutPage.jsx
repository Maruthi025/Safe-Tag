export default function AboutPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto card p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Safe Tag</h1>
        <div className="space-y-6 text-gray-600 leading-relaxed text-sm sm:text-base">
          <p>
            Safe Tag is a modern QR-based lost-and-found management platform. Our mission is to make recovering lost belongings simple, fast, and secure.
          </p>
          <h2 className="text-xl font-bold text-gray-900 pt-2">The Common QR Advantage</h2>
          <p>
            Traditional systems require unique QR codes for every physical item, creating immense logistics and printing overhead. Safe Tag changes this: every sticker bears the exact same master QR code. Our intelligent backend matching service pairs found reports with registered belongings.
          </p>
          <h2 className="text-xl font-bold text-gray-900 pt-2">Security & Privacy First</h2>
          <p>
            We strictly protect the personal data of both item owners and helpful finders. No public directory of belongings exists, and contact details are exchanged only when verified by the owner.
          </p>
        </div>
      </div>
    </div>
  )
}