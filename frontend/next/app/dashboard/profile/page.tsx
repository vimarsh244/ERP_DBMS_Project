"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Check, GraduationCap, Mail, User } from "lucide-react"

export default function ProfilePage() {
  // This would be fetched from your database in a real application
  const studentData = {
    name: "John Smith",
    id: "2023A7PS0414G",
    email: "john.smith@example.com",
    phone: "+91 98765 43210",
    branch: "Computer Science",
    graduatingYear: 2025,
    enrollmentDate: "August 2023",
    credits: {
      completed: 32,
      inProgress: 18,
      required: 120,
    },
    avatar: "/placeholder.svg?height=100&width=100",
  }

  const [formData, setFormData] = useState({
    name: studentData.name,
    email: studentData.email,
    phone: studentData.phone,
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = () => {
    // In a real application, you would save the data to the database here
    setIsEditing(false)
  }

  // Get completion percentage for the progress bar
  const completionPercentage =
    ((studentData.credits.completed + studentData.credits.inProgress) / studentData.credits.required) * 100

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">View and manage your student profile</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Personal Information</TabsTrigger>
          <TabsTrigger value="academic">Academic Information</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_250px]">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                  ) : (
                    <div className="rounded-md border border-transparent px-3 py-2 text-sm">{formData.name}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  ) : (
                    <div className="rounded-md border border-transparent px-3 py-2 text-sm">{formData.email}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                  ) : (
                    <div className="rounded-md border border-transparent px-3 py-2 text-sm">{formData.phone}</div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Your profile picture and avatar</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={studentData.avatar} alt={studentData.name} />
                  <AvatarFallback>
                    {studentData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="w-full" size="sm">
                  Change Picture
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_250px]">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>View your academic details and progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Student ID</p>
                      <p className="text-sm text-muted-foreground">{studentData.id}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{studentData.branch}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Expected Graduation</p>
                      <p className="text-sm text-muted-foreground">{studentData.graduatingYear}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Enrollment Date</p>
                      <p className="text-sm text-muted-foreground">{studentData.enrollmentDate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credit Summary</CardTitle>
                <CardDescription>Your progress towards graduation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Completed</p>
                    <Badge variant="outline">{studentData.credits.completed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">In Progress</p>
                    <Badge variant="outline">{studentData.credits.inProgress}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Required</p>
                    <Badge variant="outline">{studentData.credits.required}</Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <p className="font-medium">Completion</p>
                      <p>{completionPercentage.toFixed(0)}%</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${completionPercentage}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

