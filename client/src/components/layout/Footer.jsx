import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white text-brand-900 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                ST
              </div>
              <span className="font-bold text-xl">Safe Tag</span>
            </div>
            <p className="text-brand-200 text-sm">
              Reconnecting lost belongings with their owners through a simple, secure QR-based platform.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-brand-200 hover:text-white text-sm transition-colors">Home</Link>
              <Link to="/how-it-works" className="text-brand-200 hover:text-white text-sm transition-colors">How It Works</Link>
              <Link to="/finder" className="text-brand-200 hover:text-white text-sm transition-colors">Report Found Item</Link>
              <Link to="/login" className="text-brand-200 hover:text-white text-sm transition-colors">Admin Login</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/privacy" className="text-brand-200 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-brand-200 hover:text-white text-sm transition-colors">Terms of Use</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-brand-800 text-center text-brand-300 text-sm">
          &copy; {new Date().getFullYear()} Safe Tag. All rights reserved.
        </div>
      </div>
    </footer>
  )
}