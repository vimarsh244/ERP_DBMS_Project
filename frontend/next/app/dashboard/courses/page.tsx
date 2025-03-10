"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Filter, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { registerForCourse, dropCourse } from "@/lib/course-service"

export default function CoursesPage() {
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // This would be fetched from your database in a real application
  const coursesData = [
    {
      id: "CS101",
      name: "Introduction to Programming",
      department: "Computer Science",
      credits: 4,
      instructor: "Dr. Rajeev Kumar",
      timing: "Mon, Wed 10:00-11:30",
      location: "LT-1",
      prerequisites: [],
      offeredThisSem: true,
      registered: false,
    },
    {
      id: "CS201",
      name: "Data Structures and Algorithms",
      department: "Computer Science",
      credits: 4,
      instructor: "Dr. Sanjay Gupta",
      timing: "Tue, Thu 13:00-14:30",
      location: "LT-3",
      prerequisites: ["CS101"],
      offeredThisSem: true,
      registered: true,
    },
    {
      id: "CS301",
      name: "Database Systems",
      department: "Computer Science",
      credits: 3,
      instructor: "Dr. Priya Sharma",
      timing: "Mon, Wed 14:00-15:30",
      location: "LT-2",
      prerequisites: ["CS201"],
      offeredThisSem: true,
      registered: false,
    },
    {
      id: "MATH101",
      name: "Calculus I",
      department: "Mathematics",
      credits: 4,
      instructor: "Dr. Ramesh Iyer",
      timing: "Mon, Wed, Fri 09:00-10:00",
      location: "LT-4",
      prerequisites: [],
      offeredThisSem: true,
      registered: true,
    },
    {
      id: "PHY101",
      name: "Physics for Engineers",
      department: "Physics",
      credits: 4,
      instructor: "Dr. Amit Verma",
      timing: "Tue, Thu 15:00-16:30",
      location: "LT-5",
      prerequisites: [],
      offeredThisSem: true,
      registered: false,
    },
    {
      id: "EE201",
      name: "Digital Electronics",
      department: "Electrical Engineering",
      credits: 3,
      instructor: "Dr. Neha Gupta",
      timing: "Wed, Fri 11:00-12:30",
      location: "LT-6",
      prerequisites: ["PHY101"],
      offeredThisSem: true,
      registered: false,
    },
  ]

  const [searchQuery, setSearchQuery] = useState("")
  const [filterDepartment, setFilterDepartment] = useState<string[]>([])
  const [showRegistered, setShowRegistered] = useState<boolean | null>(null)

  const uniqueDepartments = Array.from(new Set(coursesData.map((course) => course.department)))

  const filteredCourses = coursesData.filter((course) => {
    const matchesSearch =
      course.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = filterDepartment.length === 0 || filterDepartment.includes(course.department)

    const matchesRegistration = showRegistered === null || course.registered === showRegistered

    return matchesSearch && matchesDepartment && matchesRegistration
  })

  const totalCredits = coursesData
    .filter((course) => course.registered)
    .reduce((sum, course) => sum + course.credits, 0)

  const handleRegister = async (courseId: string) => {
    setActionLoading(courseId)
    try {
      const result = await registerForCourse(courseId)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        // In a real app, you would update the course data here
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
      setActionLoading(null)
    }
  }

  const handleDrop = async (courseId: string) => {
    setActionLoading(courseId)
    try {
      const result = await dropCourse(courseId)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        // In a real app, you would update the course data here
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
      setActionLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Catalog</h1>
          <p className="text-sm text-muted-foreground">Browse and register for courses for the upcoming semester</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md bg-muted p-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Registered Credits: {totalCredits}/25</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search courses..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
              {uniqueDepartments.map((department) => (
                <DropdownMenuCheckboxItem
                  key={department}
                  checked={filterDepartment.includes(department)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilterDepartment([...filterDepartment, department])
                    } else {
                      setFilterDepartment(filterDepartment.filter((d) => d !== department))
                    }
                  }}
                >
                  {department}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Registration Status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showRegistered === true}
                onCheckedChange={() => {
                  setShowRegistered(showRegistered === true ? null : true)
                }}
              >
                Registered
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showRegistered === false}
                onCheckedChange={() => {
                  setShowRegistered(showRegistered === false ? null : false)
                }}
              >
                Not Registered
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>Available Courses</CardTitle>
          <CardDescription>
            Showing {filteredCourses.length} of {coursesData.length} courses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course ID</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.id}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs">{course.timing}</span>
                      <span className="text-xs text-muted-foreground">{course.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.registered ? (
                      <Badge className="bg-green-100 text-green-800">Registered</Badge>
                    ) : (
                      <Badge variant="outline">Not Registered</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                    {!course.registered ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => handleRegister(course.id)}
                        disabled={actionLoading === course.id}
                      >
                        {actionLoading === course.id ? "Processing..." : "Register"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 text-red-600 hover:text-red-700"
                        onClick={() => handleDrop(course.id)}
                        disabled={actionLoading === course.id}
                      >
                        {actionLoading === course.id ? "Processing..." : "Drop"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

