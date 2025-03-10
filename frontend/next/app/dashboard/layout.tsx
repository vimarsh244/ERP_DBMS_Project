import type React from "react"
import Link from "next/link"
import { BookOpen, Calendar, Clock, Home, LogOut, Settings, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link className="flex items-center gap-2 font-bold" href="/dashboard">
            <Calendar className="h-6 w-6" />
            <span>ERP 2.0</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden gap-6 md:flex">
            <Link className="text-sm font-medium" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-medium" href="/dashboard/courses">
              Courses
            </Link>
            <Link className="text-sm font-medium" href="/dashboard/timetable">
              Timetable
            </Link>
            <Link className="text-sm font-medium" href="/dashboard/profile">
              Profile
            </Link>
          </nav>
          <ThemeToggle />
          <Link href="/dashboard/profile">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-sm font-medium">JS</span>
              </div>
            </div>
          </Link>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[250px] flex-col border-r bg-muted/40 md:flex">
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  href="/dashboard"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  href="/dashboard/courses"
                >
                  <BookOpen className="h-4 w-4" />
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  href="/dashboard/timetable"
                >
                  <Calendar className="h-4 w-4" />
                  Timetable
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  href="/dashboard/history"
                >
                  <Clock className="h-4 w-4" />
                  Course History
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  href="/dashboard/profile"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  href="/dashboard/settings"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
          <div className="mt-auto border-t p-4">
            <Link
              className="flex w-full items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              href="/"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

