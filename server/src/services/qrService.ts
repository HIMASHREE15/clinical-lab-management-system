import QRCode from 'qrcode';

export const generateSampleQRCode = async (sampleId: string): Promise<string> => {
  try {
    const payload = JSON.stringify({
      sampleId,
      system: 'Clinical Lab Sample Manager',
      verifiableUrl: `http://localhost:5173/track/${sampleId}`,
      timestamp: new Date().toISOString(),
    });
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#4c1d95',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};
