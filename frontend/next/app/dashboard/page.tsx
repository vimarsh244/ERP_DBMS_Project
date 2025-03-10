import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, CheckCircle, Users, Clock, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  // This would be fetched from your database in a real application
  const studentData = {
    name: "John Smith",
    id: "2023A7PS0414G",
    branch: "Computer Science",
    graduatingYear: 2025,
    registeredCredits: 18,
    maxCredits: 25,
  }

  const upcomingClasses = [
    {
      id: "CS101",
      name: "Introduction to Programming",
      time: "10:00 AM - 11:30 AM",
      location: "LT-1",
      instructor: "Dr. Rajeev Kumar",
    },
    {
      id: "CS201",
      name: "Data Structures and Algorithms",
      time: "1:00 PM - 2:30 PM",
      location: "LT-3",
      instructor: "Dr. Sanjay Gupta",
    },
  ]

  const recentAnnouncements = [
    {
      id: 1,
      title: "New Course Added: Machine Learning Fundamentals",
      date: "Mar 8, 2025",
      priority: "info",
    },
    {
      id: 2,
      title: "Course Registration Deadline Extended",
      date: "Mar 5, 2025",
      priority: "warning",
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Welcome, {studentData.name}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Student ID</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.id}</div>
            <p className="text-xs text-muted-foreground">{studentData.branch}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Graduating Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.graduatingYear}</div>
            <p className="text-xs text-muted-foreground">Expected graduation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Registered Credits</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentData.registeredCredits} / {studentData.maxCredits}
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(studentData.registeredCredits / studentData.maxCredits) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Registration Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Complete</div>
            <p className="text-xs text-muted-foreground">Last updated: March 9, 2025</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Today's Classes</CardTitle>
            <CardDescription>Your upcoming classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((class_, index) => (
                <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{class_.name}</h3>
                      <div className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{class_.id}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {class_.time} • {class_.location}
                    </p>
                    <p className="text-sm text-muted-foreground">Instructor: {class_.instructor}</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-center">
                <Link className="text-sm text-primary underline-offset-4 hover:underline" href="/dashboard/timetable">
                  View Full Timetable
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Recent updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded text-primary">
                    {announcement.priority === "warning" ? (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground">{announcement.date}</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-center">
                <Link
                  className="text-sm text-primary underline-offset-4 hover:underline"
                  href="/dashboard/announcements"
                >
                  View All Announcements
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

