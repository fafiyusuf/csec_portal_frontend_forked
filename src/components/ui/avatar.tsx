"use client"
import { cn } from "@/lib/utils"
import Image, { type ImageProps } from "next/image"
import React from "react"

// Context and Types
type AvatarContextValue = {
  isImageLoaded: boolean
  setIsImageLoaded: React.Dispatch<React.SetStateAction<boolean>>
}

export const AvatarContext = React.createContext<AvatarContextValue | null>(null)

const useAvatarContext = () => {
  const context = React.useContext(AvatarContext)
  if (!context) {
    throw new Error("Avatar components must be used within an Avatar")
  }
  return context
}

// Root Component
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  robohashSet?: "set1" | "set2" | "set3" | "set4" | "set5" // RoboHash set options
}

const AvatarRoot = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", robohashSet = "set4", children, ...props }, ref) => {
    const [isImageLoaded, setIsImageLoaded] = React.useState(false)

    return (
      <AvatarContext.Provider value={{ isImageLoaded, setIsImageLoaded }}>
        <div
          ref={ref}
          className={cn(
            "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-100",
            {
              "h-8 w-8": size === "sm",
              "h-10 w-10": size === "md",
              "h-14 w-14": size === "lg",
            },
            className
          )}
          {...props}
        >
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === AvatarImage) {
              return React.cloneElement(child, { robohashSet } as any)
            }
            return child
          })}
        </div>
      </AvatarContext.Provider>
    )
  }
)
AvatarRoot.displayName = "Avatar"

// Image Component
interface AvatarImageProps extends Omit<ImageProps, 'alt'> {
  alt: string
  identifier?: string // Used for RoboHash generation
  robohashSet?: "set1" | "set2" | "set3" | "set4" | "set5"
}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt, fill = true, src, identifier, robohashSet = "set3", ...props }, ref) => {
    const { setIsImageLoaded } = useAvatarContext()
    
    // Generate RoboHash URL if no src is provided
    const robohashUrl = `https://robohash.org/${identifier || alt}?set=${robohashSet}&size=150x150`
    const imageSrc = src || robohashUrl

    return (
      <Image
        ref={ref}
        alt={alt}
        src={imageSrc}
        fill={fill}
        className={cn("h-full w-full object-cover", className)}
        onLoadingComplete={() => setIsImageLoaded(true)}
        onError={() => setIsImageLoaded(false)}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

// Fallback Component (unchanged)
interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  delayMs?: number
}

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, delayMs, children, ...props }, ref) => {
    const { isImageLoaded } = useAvatarContext()
    const [canRender, setCanRender] = React.useState(delayMs === undefined)

    React.useEffect(() => {
      if (delayMs !== undefined) {
        const timer = setTimeout(() => setCanRender(true), delayMs)
        return () => clearTimeout(timer)
      }
    }, [delayMs])

    return canRender && !isImageLoaded ? (
      <span
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium",
          className
        )}
        {...props}
      >
        {children}
      </span>
    ) : null
  }
)
AvatarFallback.displayName = "AvatarFallback"

// Compound Component Export
const Avatar = Object.assign(AvatarRoot, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
})

export { Avatar }
