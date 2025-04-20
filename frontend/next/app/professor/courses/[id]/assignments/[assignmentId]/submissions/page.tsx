"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAssignmentByIdAction, getSubmissionsForAssignmentAction, gradeSubmissionAction } from "@/lib/actions"

export default function AssignmentSubmissionsPage({ params }: { params: { id: string; assignmentId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [gradingSubmission, setGradingSubmission] = useState<any>(null)
  const [gradeData, setGradeData] = useState({
    grade: 0,
    feedback: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Redirect if not professor or admin
    if (session && session.user.role !== "professor" && session.user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    fetchAssignment()
    fetchSubmissions()
  }, [session, router, params.assignmentId])

  const fetchAssignment = async () => {
    try {
      const data = await getAssignmentByIdAction(params.assignmentId)
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

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const data = await getSubmissionsForAssignmentAction(params.assignmentId)
      setSubmissions(data)
    } catch (error) {
      console.error("Error fetching submissions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmission = (submission: any) => {
    setGradingSubmission(submission)
    setGradeData({
      grade: submission.grade || 0,
      feedback: submission.feedback || "",
    })
  }

  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGradeData({
      ...gradeData,
      [name]: name === "grade" ? Number(value) : value,
    })
  }

  const handleSubmitGrade = async () => {
    if (!gradingSubmission) return

    setIsSubmitting(true)

    try {
      await gradeSubmissionAction(params.assignmentId, gradingSubmission.student_id, {
        grade: gradeData.grade,
        feedback: gradeData.feedback,
      })

      toast({
        title: "Success",
        description: "Submission graded successfully",
      })

      // Update the submissions list
      fetchSubmissions()
      setGradingSubmission(null)
    } catch (error) {
      console.error("Error grading submission:", error)
      toast({
        title: "Error",
        description: "Failed to grade submission",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const downloadSubmission = (submission: any) => {
    // In a real application, this would download the file from the server
    // For now, we'll just show a toast
    toast({
      title: "Download Started",
      description: `Downloading ${submission.file_name || "submission"}`,
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignment Submissions</h1>
          <p className="text-sm text-muted-foreground">
            {assignment?.title} - Due: {assignment?.due_date && formatDate(assignment.due_date)}
          </p>
        </div>
        <Button onClick={() => router.push(`/professor/courses/${params.id}/assignments`)}>Back to Assignments</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
          <CardDescription>View and grade student submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="flex justify-center p-4 text-muted-foreground">No submissions yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.student_name}</TableCell>
                    <TableCell>{submission.student_id_number}</TableCell>
                    <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                    <TableCell>
                      {submission.file_name ? (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {submission.file_name}
                        </div>
                      ) : (
                        "Text submission"
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.status === "graded" ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Graded
                        </Badge>
                      ) : (
                        <Badge variant="outline">Submitted</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.grade !== null ? (
                        `${submission.grade}/${assignment?.max_points}`
                      ) : (
                        <span className="text-muted-foreground">Not graded</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {submission.file_name && (
                        <Button variant="ghost" size="sm" onClick={() => downloadSubmission(submission)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleGradeSubmission(submission)}>
                        Grade
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Grade Submission Dialog */}
      <Dialog open={!!gradingSubmission} onOpenChange={(open) => !open && setGradingSubmission(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              {gradingSubmission?.student_name} - {gradingSubmission?.student_id_number}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {gradingSubmission?.submission_text && (
              <div className="space-y-2">
                <Label>Submission Text</Label>
                <div className="rounded-md border p-4 text-sm">{gradingSubmission.submission_text}</div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="grade">Grade (out of {assignment?.max_points})</Label>
              <Input
                id="grade"
                name="grade"
                type="number"
                min="0"
                max={assignment?.max_points}
                value={gradeData.grade}
                onChange={handleGradeChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                name="feedback"
                value={gradeData.feedback}
                onChange={handleGradeChange}
                rows={4}
                placeholder="Provide feedback to the student"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradingSubmission(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitGrade} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
