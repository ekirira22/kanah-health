import Image from "next/image"

interface LogoProps {
  variant?: "default" | "horizontal" | "vertical"
  className?: string
}

export function Logo({ variant = "default", className = "" }: LogoProps) {
  const getLogoSource = () => {
    switch (variant) {
      case "horizontal":
        return "/logo_h.png"
      case "vertical":
        return "/logo_v.png"
      default:
        return "/logo.png"
    }
  }

  const getLogoSize = () => {
    switch (variant) {
      case "horizontal":
        return { width: 200, height: 60 }
      case "vertical":
        return { width: 120, height: 160 }
      default:
        return { width: 80, height: 80 }
    }
  }

  const { width, height } = getLogoSize()

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src={getLogoSource()}
        alt="Kanah Health Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  )
}
