const QRCode = require('qrcode');

exports.getQRCode = async (req, res, next) => {
  try {
    const websiteUrl = process.env.PUBLIC_WEBSITE_URL || 'http://localhost:5173';
    const { format = 'png' } = req.query;

    if (format === 'svg') {
      const svg = await QRCode.toString(websiteUrl, { type: 'svg', width: 300 });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
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

    res.setHeader('Cache-Control', 'public, max-age=86400');
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
