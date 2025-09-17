import QRCode from 'qrcode'

interface QRProps {
  value: string
  size?: number
}

export async function QR({ value, size = 200 }: QRProps) {
  try {
    const qrDataURL = await QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: '#E5E7EB', // --ink
        light: '#111826', // --panel
      },
    })

    return (
      <div className="dev-card p-4 inline-block">
        <img 
          src={qrDataURL} 
          alt={`QR code for ${value}`}
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
    )
  } catch (error) {
    console.error('Failed to generate QR code:', error)
    return (
      <div className="dev-card p-4 w-48 h-48 flex items-center justify-center">
        <p className="text-sm text-muted text-center">
          Failed to generate QR code
        </p>
      </div>
    )
  }
}
