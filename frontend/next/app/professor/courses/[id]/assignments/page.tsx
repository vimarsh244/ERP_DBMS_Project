"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCourseOfferingById } from "@/lib/course-service"
import { getAssignmentsForCourseOfferingAction, deleteAssignmentAction } from "@/lib/actions"

export default function CourseAssignmentsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [courseOffering, setCourseOffering] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not professor or admin
    if (session && session.user.role !== "professor" && session.user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    fetchCourseOffering()
    fetchAssignments()
  }, [session, router, params.id])

  const fetchCourseOffering = async () => {
    try {
      const offering = await getCourseOfferingById(params.id)
      setCourseOffering(offering)

      // Check if this professor teaches this course
      if (session?.user.role === "professor" && offering && offering.professor_id !== session.user.id) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to view this course",
          variant: "destructive",
        })
        router.push("/professor/courses")
      }
    } catch (error) {
      console.error("Error fetching course offering:", error)
      toast({
        title: "Error",
        description: "Failed to fetch course details",
        variant: "destructive",
      })
    }
  }

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const data = await getAssignmentsForCourseOfferingAction(params.id)
      setAssignments(data)
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

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) {
      return
    }

    try {
      await deleteAssignmentAction(id)
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      })
      fetchAssignments()
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Assignments</h1>
          <p className="text-sm text-muted-foreground">
            {courseOffering?.course_id} - {courseOffering?.course_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/professor/courses/${params.id}`)}>Back to Course</Button>
          <Button onClick={() => router.push(`/professor/courses/${params.id}/assignments/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>Manage assignments for this course</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="flex justify-center p-4 text-muted-foreground">No assignments yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Max Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(assignment.due_date)}
                      </div>
                    </TableCell>
                    <TableCell>{assignment.max_points}</TableCell>
                    <TableCell>
                      {isOverdue(assignment.due_date) ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/professor/courses/${params.id}/assignments/${assignment.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/professor/courses/${params.id}/assignments/${assignment.id}/submissions`)
                        }
                      >
                        Submissions
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/professor/courses/${params.id}/assignments/${assignment.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        Delete
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
