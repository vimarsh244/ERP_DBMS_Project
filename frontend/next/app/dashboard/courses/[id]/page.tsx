"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, BookOpen, Calendar, CheckCircle, Clock, FileText, MapPin, User } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { registerForCourse, dropCourse } from "@/lib/course-service"

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // This would be fetched from your database in a real application based on the ID
  const course = {
    id: params.id,
    name:
      params.id === "CS101"
        ? "Introduction to Programming"
        : params.id === "CS201"
          ? "Data Structures and Algorithms"
          : params.id === "MATH101"
            ? "Calculus I"
            : "Course Details",
    department: params.id.startsWith("CS")
      ? "Computer Science"
      : params.id.startsWith("MATH")
        ? "Mathematics"
        : "Department",
    credits: 4,
    instructor:
      params.id === "CS101"
        ? "Dr. Rajeev Kumar"
        : params.id === "CS201"
          ? "Dr. Sanjay Gupta"
          : params.id === "MATH101"
            ? "Dr. Ramesh Iyer"
            : "Instructor",
    timing:
      params.id === "CS101"
        ? "Mon, Wed 10:00-11:30"
        : params.id === "CS201"
          ? "Tue, Thu 13:00-14:30"
          : params.id === "MATH101"
            ? "Mon, Wed, Fri 09:00-10:00"
            : "Timing",
    location:
      params.id === "CS101" ? "LT-1" : params.id === "CS201" ? "LT-3" : params.id === "MATH101" ? "LT-4" : "Location",
    prerequisites: params.id === "CS201" ? ["CS101"] : [],
    offeredThisSem: true,
    registered: params.id === "CS201" || params.id === "MATH101",
    description:
      "This course provides an introduction to the fundamentals of the subject matter, covering both theoretical concepts and practical applications. Students will gain a comprehensive understanding of key principles and develop essential skills through hands-on exercises and projects.",
    syllabus: [
      "Introduction to the subject",
      "Basic principles and theories",
      "Advanced concepts and applications",
      "Practical skills and techniques",
      "Case studies and real-world examples",
      "Final project and assessment",
    ],
  }

  // Current registered credits (this would come from your database)
  const currentCredits = 18
  const maxCredits = 25

  const isPrerequisitesMet = true // This would be determined by checking the student's course history

  // Handle course registration
  const handleRegister = async () => {
    setIsLoading(true)
    try {
      const result = await registerForCourse(course.id)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        // Refresh the page or update the UI
        router.refresh()
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle course drop
  const handleDrop = async () => {
    setIsLoading(true)
    try {
      const result = await dropCourse(course.id)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        // Refresh the page or update the UI
        router.refresh()
      } else {
        toast({
          title: "Drop Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <p className="text-sm text-muted-foreground">
            {course.id} • {course.department}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {course.registered ? (
            <Button variant="destructive" onClick={handleDrop} disabled={isLoading}>
              {isLoading ? "Processing..." : "Drop Course"}
            </Button>
          ) : (
            <Button
              disabled={!isPrerequisitesMet || currentCredits + course.credits > maxCredits || isLoading}
              onClick={handleRegister}
            >
              {isLoading ? "Processing..." : "Register for Course"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{course.description}</p>
              <Separator className="my-4" />
              <h3 className="mb-2 font-semibold">Course Syllabus</h3>
              <ul className="list-inside list-disc space-y-2">
                {course.syllabus.map((item, index) => (
                  <li key={index} className="text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {!isPrerequisitesMet && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Prerequisites Not Met</AlertTitle>
              <AlertDescription>You have not completed the required prerequisite courses.</AlertDescription>
            </Alert>
          )}

          {currentCredits + course.credits > maxCredits && !course.registered && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Credit Limit Exceeded</AlertTitle>
              <AlertDescription>
                Registering for this course would exceed your maximum credit limit of {maxCredits}.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Credits</p>
                  <p className="text-sm text-muted-foreground">{course.credits} credits</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Instructor</p>
                  <p className="text-sm text-muted-foreground">{course.instructor}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Schedule</p>
                  <p className="text-sm text-muted-foreground">{course.timing}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{course.location}</p>
                </div>
              </div>
              {course.prerequisites.length > 0 && (
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Prerequisites</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {course.prerequisites.map((prereq) => (
                        <Badge key={prereq} variant="outline">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {course.registered ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <p className="text-sm text-green-600">Registered</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not Registered</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Registration Status</CardTitle>
              <CardDescription>Your current registration status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Current Credits</p>
                  <p className="text-sm">{currentCredits}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Max Credits</p>
                  <p className="text-sm">{maxCredits}</p>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(currentCredits / maxCredits) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

