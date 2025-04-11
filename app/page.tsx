import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary p-1">
              <div className="h-6 w-6 rounded-full bg-white" />
            </div>
            <span className="text-xl font-bold">MindEase</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Log in
            </Link>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Take control of your <span className="text-primary">mental wellbeing</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Track your mood, journal your thoughts, and develop healthy mental habits with MindEase, your personal
              mental wellness companion.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-secondary py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                  <div className="h-6 w-6 rounded-full bg-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Mood Tracking</h3>
                <p className="text-muted-foreground">
                  Track your daily mood and identify patterns to better understand your emotional wellbeing.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                  <div className="h-6 w-6 rounded-full bg-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Journaling</h3>
                <p className="text-muted-foreground">
                  Express your thoughts and feelings through journaling to gain clarity and reduce stress.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                  <div className="h-6 w-6 rounded-full bg-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Progress Insights</h3>
                <p className="text-muted-foreground">
                  Visualize your mental health journey with insights and trends based on your data.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MindEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

