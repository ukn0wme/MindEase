import LoginForm from "@/components/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="rounded-full bg-primary p-1">
            <div className="h-6 w-6 rounded-full bg-white" />
          </div>
          <span className="text-2xl font-bold">MindEase</span>
        </Link>
        <p className="mt-2 text-muted-foreground">Your mental wellness companion</p>
      </div>
      <LoginForm />
    </div>
  )
}

