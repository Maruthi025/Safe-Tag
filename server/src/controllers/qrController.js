const QRCode = require('qrcode');

exports.getQRCode = async (req, res, next) => {
  try {
    let websiteUrl = process.env.PUBLIC_WEBSITE_URL;

    // Detect live frontend origin if env is not set or set to localhost
    if (!websiteUrl || websiteUrl.includes('localhost')) {
      const origin = req.headers.origin || req.headers.referer;
      if (origin && !origin.includes('localhost')) {
        try {
          const parsed = new URL(origin);
          websiteUrl = `${parsed.protocol}//${parsed.host}`;
        } catch (e) {
          websiteUrl = origin;
        }
      }
    }

    if (!websiteUrl || websiteUrl.includes('localhost')) {
      if (process.env.NODE_ENV === 'production') {
        websiteUrl = 'https://safe-tag-app.vercel.app';
      } else {
        websiteUrl = 'http://localhost:5173';
      }
    }

    const { format = 'png' } = req.query;

    if (format === 'svg') {
      const svg = await QRCode.toString(websiteUrl, { type: 'svg', width: 300 });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(svg);
    }

    // Default: PNG as base64 data URL
    const dataUrl = await QRCode.toDataURL(websiteUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json({
      status: 'success',
      data: {
        qrCode: dataUrl,
        qrDataUrl: dataUrl,
        url: websiteUrl,
        encodedUrl: websiteUrl,
        note: 'This is the single common QR code for all Safe Tag stickers.',
      },
    });
  } catch (error) {
    next(error);
  }
};
