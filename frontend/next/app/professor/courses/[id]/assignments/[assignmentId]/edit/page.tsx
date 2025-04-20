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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getAssignmentByIdAction, updateAssignmentAction } from "@/lib/actions"

export default function EditAssignmentPage({ params }: { params: { id: string; assignmentId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    max_points: 100,
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignment()
  }, [params.assignmentId])

  const fetchAssignment = async () => {
    try {
      setLoading(true)
      const assignment = await getAssignmentByIdAction(params.assignmentId)

      if (!assignment) {
        toast({
          title: "Error",
          description: "Assignment not found",
          variant: "destructive",
        })
        router.push(`/professor/courses/${params.id}/assignments`)
        return
      }

      // Format the date for the datetime-local input
      const dueDate = new Date(assignment.due_date)
      const formattedDate = dueDate.toISOString().slice(0, 16)

      setFormData({
        title: assignment.title,
        description: assignment.description || "",
        due_date: formattedDate,
        max_points: assignment.max_points,
        is_active: assignment.is_active,
      })
    } catch (error) {
      console.error("Error fetching assignment:", error)
      toast({
        title: "Error",
        description: "Failed to fetch assignment details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: Number(value),
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateAssignmentAction(params.assignmentId, {
        title: formData.title,
        description: formData.description,
        due_date: new Date(formData.due_date).toISOString(),
        max_points: formData.max_points,
        is_active: formData.is_active,
      })

      toast({
        title: "Success",
        description: "Assignment updated successfully",
      })

      router.push(`/professor/courses/${params.id}/assignments`)
    } catch (error) {
      console.error("Error updating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Assignment</h1>
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
          <h1 className="text-2xl font-bold">Edit Assignment</h1>
          <p className="text-sm text-muted-foreground">Update assignment details</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/professor/courses/${params.id}/assignments`)}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Edit the details for this assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Assignment title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Assignment description and instructions"
                value={formData.description}
                onChange={handleChange}
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  name="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_points">Maximum Points</Label>
                <Input
                  id="max_points"
                  name="max_points"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.max_points}
                  onChange={handleNumberChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Active Assignment</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
