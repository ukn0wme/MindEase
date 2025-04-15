"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useToast } from "./use-toast"

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<any[]>([])

  React.useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { toast } = event.detail
      setToasts((prev) => [...prev, toast])

      if (toast.duration !== Number.POSITIVE_INFINITY) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id))
        }, toast.duration)
      }
    }

    window.addEventListener("toast" as any, handleToast as any)
    return () => window.removeEventListener("toast" as any, handleToast as any)
  }, [])

  return (
    <>
      {children}
      <div className="fixed top-0 right-0 z-[100] flex flex-col gap-2 p-4 max-h-screen overflow-hidden">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </>
  )
}

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface ToastProps extends VariantProps<typeof toastVariants> {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, id, title, description, onClose, ...props }, ref) => {
    const { dismiss } = useToast()

    return (
      <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
        <div className="grid gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        <button
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          onClick={() => {
            if (id) dismiss(id)
            if (onClose) onClose()
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    )
  },
)
Toast.displayName = "Toast"

export { ToastProvider, Toast }
