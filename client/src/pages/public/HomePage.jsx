import { Link } from 'react-router-dom'
import { Shield, Search, QrCode, CheckCircle, Lock, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    q: 'How does Safe Tag work without a unique QR per item?',
    a: 'All Safe Tag stickers share the exact same QR code that opens this website. When a finder submits details about what they found, our system compares those details against registered lost items to identify possible matches. The owner then reviews and confirms.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. Your contact details and location data are stored securely and are never shown publicly. Only enough information is shared to facilitate item recovery, and only between verified parties.',
  },
  {
    q: 'Do I need to create an account to report a found item?',
    a: 'No. Finders can submit a report without creating any account. You only need an account to register your own belongings.',
  },
  {
    q: 'Is location sharing required?',
    a: 'Location sharing is completely optional. Finders can submit their report without sharing their device location. A manual location description is always available.',
  },
  {
    q: 'How many QR codes do I need to print?',
    a: 'Just one! Every Safe Tag sticker uses the exact same QR code, which points to this website. You can print as many copies as you need from a single master QR.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <ChevronDown className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{a}</div>}
    </div>
  )
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6 border border-white/20">
            <QrCode className="h-4 w-4" /> One Universal QR Code for Every Sticker
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Lost Something?<br />Found Something?<br />
            <span className="text-accent-100">Let's Reconnect.</span>
          </h1>
          <p className="text-lg sm:text-xl text-brand-200 mb-10 max-w-2xl mx-auto">
            Safe Tag helps people report found belongings and reconnect lost items with their owners through a simple QR-based platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/admin" className="bg-white text-brand-800 font-semibold px-8 py-4 rounded-xl hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg">
              <Shield className="h-5 w-5" /> Admin Portal
            </Link>
            <Link to="/finder" className="bg-accent-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-accent-600 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg">
              <Search className="h-5 w-5" /> Report Found Item
            </Link>
          </div>
        </div>
      </section>

      {/* Two main choices */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Choose Your Portal</h2>
          <p className="text-center text-gray-600 mb-10">Whether you lost an item or found someone else's, select your option below</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card hover:shadow-lg hover:border-brand-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-brand-100 text-brand-700 p-3 rounded-xl">
                    <Shield className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Admin Portal</h3>
                    <p className="text-xs text-brand-600 font-medium">FOR ITEM OWNERS</p>
                  </div>
                </div>
                <ul className="text-gray-600 text-sm space-y-3 mb-6">
                  {['Register and protect your belongings', 'Report lost items immediately', 'Review AI-powered found item matches', 'Coordinate safe and verified recovery'].map(t => (
                    <li key={t} className="flex items-center gap-2.5">
                      <CheckCircle className="h-4 w-4 text-brand-600 flex-shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/login" className="btn-primary w-full py-3">Enter Admin Portal</Link>
            </div>

            <div className="card hover:shadow-lg hover:border-amber-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 text-amber-700 p-3 rounded-xl">
                    <Search className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Finder Portal</h3>
                    <p className="text-xs text-amber-600 font-medium">NO ACCOUNT NEEDED</p>
                  </div>
                </div>
                <ul className="text-gray-600 text-sm space-y-3 mb-6">
                  {['Report a found item in under 2 minutes', 'Optional one-tap location sharing', 'Secure finder contact preservation', 'Help return belongings to their owner'].map(t => (
                    <li key={t} className="flex items-center gap-2.5">
                      <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/finder" className="inline-flex items-center justify-center w-full px-4 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
                  Report Found Item
                </Link>
                <Link to="/finder/reports" className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  View My Found Reports History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">How Safe Tag Works</h2>
          <p className="text-center text-gray-600 mb-12">One common QR sticker protects all of your belongings</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', icon: QrCode, title: 'Attach Sticker', desc: 'Place a common Safe Tag QR sticker on your phone, laptop, keys, or bag.' },
              { step: '2', icon: Shield, title: 'Register Online', desc: 'Create your owner account and register details about your item.' },
              { step: '3', icon: Search, title: 'Finder Scans', desc: 'Anyone who finds it scans the code and quickly submits a found report.' },
              { step: '4', icon: CheckCircle, title: 'Safe Recovery', desc: 'Our smart matching notifies you. Confirm ownership and arrange return.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="card text-center relative pt-8">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-700 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow">
                  {step}
                </span>
                <div className="bg-brand-50 text-brand-700 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy guarantee */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-brand-50 border-brand-200 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="bg-brand-100 p-3 rounded-xl flex-shrink-0 text-brand-800">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-900 mb-1.5">Strict Privacy & Safety</h3>
                <p className="text-brand-700 text-sm leading-relaxed">
                  Safe Tag never exposes personal contact details publicly. Finders and owners communicate only after a confirmed match is verified by the owner. Device location is strictly optional with explicit user consent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Frequently Asked Questions</h2>
          <p className="text-center text-gray-600 mb-8">Everything you need to know about Safe Tag</p>
          <div className="flex flex-col gap-3">
            {faqs.map((faq) => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>
    </div>
  )
}