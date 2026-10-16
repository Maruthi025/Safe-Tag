import { useEffect, useState } from 'react'
import { Download, Printer, ExternalLink } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ErrorMessage from '../../components/shared/ErrorMessage'

export default function QRPage() {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/qr').then(r => setQrData(r.data.data)).catch(() => setError('Failed to generate QR code.')).finally(() => setLoading(false))
  }, [])

  const qrImage = qrData?.qrDataUrl || qrData?.qrCode
  const encodedUrl = qrData?.encodedUrl || qrData?.url || 'http://localhost:5173'

  const download = () => {
    if (!qrImage) return
    const a = document.createElement('a')
    a.href = qrImage
    a.download = 'safe-tag-master-qr.png'
    a.click()
  }

  const print = () => {
    if (!qrImage) return
    const w = window.open('', '_blank')
    w.document.write(`
      <!DOCTYPE html>
      <html><head><title>Safe Tag - Master QR Sticker Sheet</title>
      <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; }
        .card { display: inline-block; border: 2px dashed #1e3a8a; border-radius: 16px; padding: 24px; margin: 12px; }
        img { width: 220px; height: 220px; }
        h1 { color: #1e3a8a; margin: 0 0 8px 0; font-size: 24px; }
        p { color: #4b5563; font-size: 14px; margin: 8px 0; }
        .url { font-family: monospace; font-size: 12px; color: #1d4ed8; }
      </style>
      </head><body>
      <div class="card">
        <h1>Safe Tag</h1>
        <img src="${qrImage}" alt="Safe Tag QR Code" />
        <p><strong>Scan to report lost or found item</strong></p>
        <p class="url">${encodedUrl}</p>
      </div>
      <script>window.onload = () => window.print()</script>
      </body></html>
    `)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Master QR Sticker Code</h1>
        <p className="text-gray-500 text-xs mt-0.5">Every sticker uses this exact identical QR code</p>
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6">
        <h3 className="text-brand-900 font-semibold text-sm mb-1">Universal QR Code Requirement</h3>
        <p className="text-brand-700 text-xs leading-relaxed">
          This single QR code is printed on all Safe Tag physical stickers. When scanned, it opens the Safe Tag website where users choose whether they are the Owner (Admin) or a Finder.
        </p>
      </div>

      {loading ? <div className="py-20"><LoadingSpinner size="lg" /></div> :
        error ? <ErrorMessage message={error} /> : (
          <div className="card text-center p-8">
            <div className="inline-block bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
              <img src={qrImage} alt="Safe Tag QR Code" className="w-56 h-56 mx-auto" />
            </div>
            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-1">Encoded Public Website URL:</p>
              <a href={encodedUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline inline-flex items-center gap-1 font-mono text-sm font-semibold">
                {encodedUrl} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={download} className="btn-primary text-sm">
                <Download className="h-4 w-4" /> Download Sticker PNG
              </button>
              <button onClick={print} className="btn-secondary text-sm">
                <Printer className="h-4 w-4" /> Print Sticker Sheet
              </button>
            </div>
          </div>
        )
      }
    </div>
  )
}