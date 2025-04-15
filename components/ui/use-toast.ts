"use client"

// Adapted from shadcn/ui
import { useState, useEffect, useCallback } from "react"

export type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type Toast = ToastProps & {
  id: string
  open: boolean
}

type ToastActionType = {
  toast: (props: ToastProps) => void
  dismiss: (toastId?: string) => void
}

// Simple in-memory store for toasts
let toasts: Toast[] = []
let listeners: ((toasts: Toast[]) => void)[] = []

const updateToasts = (newToasts: Toast[]) => {
  toasts = newToasts
  listeners.forEach((listener) => listener(toasts))
}

export function toast(props: ToastProps) {
  const id = Math.random().toString(36).substring(2, 9)
  const newToast: Toast = {
    id,
    open: true,
    variant: "default",
    duration: 5000,
    ...props,
  }

  updateToasts([...toasts, newToast])

  if (newToast.duration !== Number.POSITIVE_INFINITY) {
    setTimeout(() => {
      updateToasts(toasts.map((t) => (t.id === id ? { ...t, open: false } : t)))

      // Remove from array after animation
      setTimeout(() => {
        updateToasts(toasts.filter((t) => t.id !== id))
      }, 300)
    }, newToast.duration)
  }

  return id
}

toast.dismiss = (toastId?: string) => {
  if (toastId) {
    updateToasts(toasts.map((t) => (t.id === toastId ? { ...t, open: false } : t)))
  } else {
    updateToasts(toasts.map((t) => ({ ...t, open: false })))
  }
}

export function useToast(): ToastActionType {
  const [, setToastsState] = useState<Toast[]>(toasts)

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToastsState([...newToasts])
    }

    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  const toastCallback = useCallback((props: ToastProps) => {
    return toast(props)
  }, [])

  const dismissCallback = useCallback((toastId?: string) => {
    toast.dismiss(toastId)
  }, [])

  return {
    toast: toastCallback,
    dismiss: dismissCallback,
  }
}
