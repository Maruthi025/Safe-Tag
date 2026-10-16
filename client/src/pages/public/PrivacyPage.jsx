export default function PrivacyPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto card p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-xs mb-8">Effective Date: {new Date().toLocaleDateString()}</p>
        <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. Data We Collect</h2>
            <p><strong>Registered Owners:</strong> Name, email address, optional phone number, and registered belongings information.</p>
            <p className="mt-1"><strong>Finders:</strong> Name, phone or email contact method, found item description, and optional location if explicitly granted.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. Geolocation Privacy</h2>
            <p>Finder location sharing is strictly optional. We will never automatically capture location coordinates on page load. Precise coordinates are accessible exclusively to the verified owner of a matched item.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3. Data Sharing</h2>
            <p>We do not sell personal data. Contact details are never displayed publicly and are only visible between owner and finder during an active recovery.</p>
          </section>
        </div>
      </div>
    </div>
  )
}