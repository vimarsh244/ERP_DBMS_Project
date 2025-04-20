"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAssignmentByIdAction, getSubmissionForStudentAction, submitAssignmentAction } from "@/lib/actions"

export default function SubmitAssignmentPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [assignment, setAssignment] = useState<any>(null)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    submission_text: "",
    file: null as File | null,
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchAssignment()
      fetchExistingSubmission()
    }
  }, [session, params.id])

  const fetchAssignment = async () => {
    try {
      const data = await getAssignmentByIdAction(params.id)
      setAssignment(data)

      // Check if assignment is overdue
      if (new Date(data.due_date) < new Date() && !existingSubmission) {
        toast({
          title: "Assignment Overdue",
          description: "This assignment is past its due date and cannot be submitted.",
          variant: "destructive",
        })
        router.push("/dashboard/assignments")
      }
    } catch (error) {
      console.error("Error fetching assignment:", error)
      toast({
        title: "Error",
        description: "Failed to fetch assignment details",
        variant: "destructive",
      })
    }
  }

  const fetchExistingSubmission = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      const submission = await getSubmissionForStudentAction(params.id, session.user.id)

      if (submission) {
        setExistingSubmission(submission)
        setFormData({
          submission_text: submission.submission_text || "",
          file: null,
        })
      }
    } catch (error) {
      console.error("Error fetching submission:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      submission_text: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setIsSubmitting(true)

    try {
      // In a real application, you would upload the file to a storage service
      // and get a URL or path to store in the database
      let filePath = null
      let fileName = null
      let fileType = null

      if (formData.file) {
        // Simulate file upload
        filePath = `/uploads/${session.user.id}_${formData.file.name}`
        fileName = formData.file.name
        fileType = formData.file.type
      }

      await submitAssignmentAction({
        assignment_id: params.id,
        student_id: session.user.id,
        submission_text: formData.submission_text,
        file_path: filePath,
        file_name: fileName,
        file_type: fileType,
      })

      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      })

      router.push("/dashboard/assignments")
    } catch (error) {
      console.error("Error submitting assignment:", error)
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Submit Assignment</h1>
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
          <h1 className="text-2xl font-bold">Submit Assignment</h1>
          <p className="text-sm text-muted-foreground">
            {assignment?.course_name} - {assignment?.title}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/assignments")}>
          Cancel
        </Button>
      </div>

      {assignment && isOverdue(assignment.due_date) && !existingSubmission && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Assignment Overdue</AlertTitle>
          <AlertDescription>
            This assignment was due on {formatDate(assignment.due_date)} and can no longer be submitted.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{existingSubmission ? "Edit Submission" : "Submit Assignment"}</CardTitle>
            <CardDescription>
              {assignment?.description}
              <div className="mt-2 text-sm">
                <span className="font-medium">Due Date:</span> {assignment?.due_date && formatDate(assignment.due_date)}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="submission_text">Submission Text</Label>
              <Textarea
                id="submission_text"
                placeholder="Enter your submission text or notes here"
                value={formData.submission_text}
                onChange={handleTextChange}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File (Optional)</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
              <p className="text-xs text-muted-foreground">
                Accepted file types: PDF, Word documents, images, text files
              </p>
              {existingSubmission?.file_name && (
                <p className="text-sm">
                  Current file: <span className="font-medium">{existingSubmission.file_name}</span>
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (isOverdue(assignment?.due_date) && !existingSubmission) ||
                (!formData.submission_text && !formData.file)
              }
            >
              {isSubmitting ? "Submitting..." : existingSubmission ? "Update Submission" : "Submit Assignment"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
