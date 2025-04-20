"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Download, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAssignmentByIdAction, getSubmissionForStudentAction } from "@/lib/actions"

export default function ViewAssignmentPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [assignment, setAssignment] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchAssignment()
      fetchSubmission()
    }
  }, [session, params.id])

  const fetchAssignment = async () => {
    try {
      const data = await getAssignmentByIdAction(params.id)
      setAssignment(data)
    } catch (error) {
      console.error("Error fetching assignment:", error)
      toast({
        title: "Error",
        description: "Failed to fetch assignment details",
        variant: "destructive",
      })
    }
  }

  const fetchSubmission = async () => {
    if (!session?.user?.id) return

    try {
      const data = await getSubmissionForStudentAction(params.id, session.user.id)
      setSubmission(data)
    } catch (error) {
      console.error("Error fetching submission:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const downloadSubmission = () => {
    // In a real application, this would download the file from the server
    // For now, we'll just show a toast
    toast({
      title: "Download Started",
      description: `Downloading ${submission.file_name}`,
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Assignment Details</h1>
            <p className="text-sm text-muted-foreground">Loading assignment details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignment Details</h1>
          <p className="text-sm text-muted-foreground">
            {assignment?.course_name} - {assignment?.title}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/assignments")}>
          Back to Assignments
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Information</CardTitle>
            <CardDescription>Details about this assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm">{assignment?.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Due Date</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {assignment?.due_date && formatDate(assignment.due_date)}
                  {assignment?.due_date && isOverdue(assignment.due_date) && !submission && (
                    <Badge variant="destructive">Overdue</Badge>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Maximum Points</h3>
                <p className="text-sm">{assignment?.max_points}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold">Course</h3>
              <p className="text-sm">{assignment?.course_name}</p>
            </div>

            <div>
              <h3 className="font-semibold">Instructor</h3>
              <p className="text-sm">{assignment?.creator_name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
            <CardDescription>
              {submission
                ? `Submitted on ${formatDate(submission.submitted_at)}`
                : "You have not submitted this assignment yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission ? (
              <>
                {submission.submission_text && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Submission Text</h3>
                    <div className="rounded-md border p-4 text-sm">{submission.submission_text}</div>
                  </div>
                )}

                {submission.file_name && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Uploaded File</h3>
                    <div className="flex items-center justify-between rounded-md border p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {submission.file_name}
                      </div>
                      <Button variant="ghost" size="sm" onClick={downloadSubmission}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Status</h3>
                  {submission.status === "graded" ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Graded</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Submitted</Badge>
                  )}
                </div>

                {submission.status === "graded" && (
                  <>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Grade</h3>
                      <p className="text-lg font-medium">
                        {submission.grade} / {assignment?.max_points}
                      </p>
                    </div>

                    {submission.feedback && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">Feedback</h3>
                        <div className="rounded-md border p-4 text-sm">{submission.feedback}</div>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-4">
                  {!isOverdue(assignment?.due_date) && (
                    <Button onClick={() => router.push(`/dashboard/assignments/${params.id}/submit`)}>
                      Edit Submission
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="rounded-full bg-muted p-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium">No Submission Yet</h3>
                  <p className="text-sm text-muted-foreground">Submit your work before the deadline</p>
                </div>
                {!isOverdue(assignment?.due_date) ? (
                  <Button onClick={() => router.push(`/dashboard/assignments/${params.id}/submit`)}>
                    Submit Assignment
                  </Button>
                ) : (
                  <Badge variant="destructive">Deadline Passed</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
