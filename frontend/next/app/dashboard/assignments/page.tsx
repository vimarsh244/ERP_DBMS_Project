"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAssignmentsForStudentAction, getSubmissionForStudentAction } from "@/lib/actions"

export default function StudentAssignmentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchAssignments()
    }
  }, [session])

  const fetchAssignments = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      const data = await getAssignmentsForStudentAction(session.user.id)
      setAssignments(data)

      // Fetch submission status for each assignment
      const submissionData: Record<string, any> = {}
      for (const assignment of data) {
        const submission = await getSubmissionForStudentAction(assignment.id, session.user.id)
        if (submission) {
          submissionData[assignment.id] = submission
        }
      }
      setSubmissions(submissionData)
    } catch (error) {
      console.error("Error fetching assignments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      })
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

  const getSubmissionStatus = (assignmentId: string) => {
    const submission = submissions[assignmentId]
    if (!submission) {
      return "Not Submitted"
    }
    if (submission.status === "graded") {
      return "Graded"
    }
    return "Submitted"
  }

  const getStatusBadge = (assignmentId: string) => {
    const status = getSubmissionStatus(assignmentId)
    const submission = submissions[assignmentId]

    if (status === "Graded") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Graded: {submission.grade}/{assignments.find((a) => a.id === assignmentId)?.max_points}
        </Badge>
      )
    }
    if (status === "Submitted") {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Submitted</Badge>
    }
    return <Badge variant="outline">Not Submitted</Badge>
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Assignments</h1>
          <p className="text-sm text-muted-foreground">View and submit assignments for your courses</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
          <CardDescription>Assignments from your enrolled courses</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="flex justify-center p-4 text-muted-foreground">No assignments found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.course_name}</TableCell>
                    <TableCell>{assignment.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(assignment.due_date)}
                        {isOverdue(assignment.due_date) && !submissions[assignment.id] && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(assignment.id)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/assignments/${assignment.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/assignments/${assignment.id}/submit`)}
                        disabled={
                          isOverdue(assignment.due_date) && getSubmissionStatus(assignment.id) === "Not Submitted"
                        }
                      >
                        {getSubmissionStatus(assignment.id) === "Not Submitted" ? "Submit" : "Edit Submission"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
