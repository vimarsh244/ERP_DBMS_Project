import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, DownloadCloud, FileBarChart } from "lucide-react"

export default function CourseHistoryPage() {
  // This would be fetched from your database in a real application
  const courseHistory = [
    {
      id: "CS F241",
      name: "Microprocessors and Interfacing",
      semester: "Spring 2025",
      credits: 4,
      grade: "A-",
      instructor: "Dr. Gargi Prabhu",
    },
    {
      id: "CS F211",
      name: "Data Structures and Algorithms",
      semester: "Spring 2025",
      credits: 4,
      grade: "B",
      instructor: "Dr. Sujith Thomas",
    },
    {
      id: "CS F215",
      name: "Digital Design",
      semester: "Fall 2024",
      credits: 4,
      grade: "B",
      instructor: "Dr. Harikrishnan",
    },
    {
      id: "CS F212",
      name: "Database Management Systems",
      semester: "Fall 2024",
      credits: 4,
      grade: "A",
      instructor: "Dr. Shubhangi & Dr. Neena",
    }
  ]

  // Calculate GPA
  const getGradePoints = (grade) => {
    const gradeMap = {
      A: 10,
      "A-": 9,
      B: 8,
      "B-": 7,
      C: 6,
      "C-": 5,
      D: 4,
      E: 2,
      F: 0,
    }
    return gradeMap[grade] || 0
  }

  const completedCourses = courseHistory.filter((course) => course.grade !== "In Progress")
  const totalCredits = completedCourses.reduce((sum, course) => sum + course.credits, 0)
  const totalGradePoints = completedCourses.reduce(
    (sum, course) => sum + getGradePoints(course.grade) * course.credits,
    0,
  )
  const gpa = totalGradePoints / totalCredits

  // Group courses by semester
  const semesters = Array.from(new Set(courseHistory.map((course) => course.semester)))

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course History</h1>
          <p className="text-sm text-muted-foreground">View your academic record and course history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileBarChart className="h-4 w-4" />
            Generate Transcript
          </Button>
          <Button variant="outline" className="gap-2">
            <DownloadCloud className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>GPA</CardTitle>
            <CardDescription>Current cumulative GPA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{gpa.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total Credits: {totalCredits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Completed Courses</CardTitle>
            <CardDescription>Total courses completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedCourses.length}</div>
            <p className="text-xs text-muted-foreground">Out of {courseHistory.length} enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Academic standing</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-lg font-medium">Good Standing</span>
          </CardContent>
        </Card>
      </div>

      {semesters.map((semester) => (
        <Card key={semester}>
          <CardHeader>
            <CardTitle>{semester}</CardTitle>
            <CardDescription>Courses taken in {semester}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseHistory
                  .filter((course) => course.semester === semester)
                  .map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.id}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>{course.instructor}</TableCell>
                      <TableCell>
                        {course.grade === "In Progress" ? (
                          <Badge variant="outline">In Progress</Badge>
                        ) : (
                          <Badge
                            className={
                              course.grade.startsWith("A")
                                ? "bg-green-100 text-green-800"
                                : course.grade.startsWith("B")
                                  ? "bg-blue-100 text-blue-800"
                                  : course.grade.startsWith("C")
                                    ? "bg-yellow-100 text-yellow-800"
                                    : course.grade.startsWith("D")
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"
                            }
                          >
                            {course.grade}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

