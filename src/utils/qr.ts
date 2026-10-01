import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#fdfaf5',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
}
