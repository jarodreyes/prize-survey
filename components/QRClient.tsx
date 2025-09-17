'use client'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QRClientProps {
  value: string
  size?: number
}

export function QRClient({ value, size = 200 }: QRClientProps) {
  const [qrDataURL, setQrDataURL] = useState<string>('')
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataURL = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000', // Black for white background
            light: '#FFFFFF', // White background
          },
        })
        setQrDataURL(dataURL)
        setError(false)
      } catch (err) {
        console.error('Failed to generate QR code:', err)
        setError(true)
      }
    }

    if (value) {
      generateQR()
    }
  }, [value, size])

  if (error) {
    return (
      <div className="dev-card p-4 w-48 h-48 flex items-center justify-center">
        <p className="text-sm text-muted text-center">
          Failed to generate QR code
        </p>
      </div>
    )
  }

  if (!qrDataURL) {
    return (
      <div className="dev-card p-4 w-48 h-48 flex items-center justify-center">
        <p className="text-sm text-muted text-center">
          Generating QR code...
        </p>
      </div>
    )
  }

  return (
    <div className="p-2 bg-white border border-gray-200 rounded-lg inline-block">
      <img 
        src={qrDataURL} 
        alt={`QR code for ${value}`}
        width={size}
        height={size}
        className="rounded"
      />
    </div>
  )
}
