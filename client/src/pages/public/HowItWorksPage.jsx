import { QrCode, Shield, Search, CheckCircle, Bell, Map } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HowItWorksPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">How Safe Tag Works</h1>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          A secure, privacy-preserving process to reunite lost items with their rightful owners.
        </p>
        
        <div className="space-y-8">
          {[
            { icon: QrCode, title: '1. One Universal QR Code', desc: 'All Safe Tag stickers share the exact same QR code pointing to the platform. No custom printing per item is ever required. Print hundreds of identical stickers from one master file.' },
            { icon: Shield, title: '2. Owner Belongings Registry', desc: 'Owners log into the Admin portal to catalog their items with descriptions, colors, brands, and serial numbers. If an item goes missing, mark it lost with one click.' },
            { icon: Search, title: '3. Fast Finder Submission', desc: 'Anyone finding a tagged item scans the QR code and fills out the brief Finder form. No login or registration required for finders.' },
            { icon: Map, title: '4. Optional Location Sharing', desc: 'Finders may voluntarily share their GPS location with explicit browser permission. Denying location permission never blocks submission.' },
            { icon: Bell, title: '5. Rule-Based Smart Matching', desc: 'Safe Tag computes similarity scores based on category, description, brand, color, features, and timeline, alerting the owner to potential matches.' },
            { icon: CheckCircle, title: '6. Controlled Safe Return', desc: 'The owner reviews match details and confirms or rejects. If confirmed, recovery coordination details are shared securely.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card flex gap-5 items-start">
              <div className="bg-brand-50 text-brand-700 p-3 rounded-xl flex-shrink-0">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center flex flex-wrap gap-4 justify-center">
          <Link to="/finder" className="btn-primary px-6 py-3">Report a Found Item</Link>
          <Link to="/register" className="btn-secondary px-6 py-3">Create Owner Account</Link>
        </div>
      </div>
    </div>
  )
}