/**
 * Course Service
 * This file contains methods for interacting with the course API
 */

// Types
export interface Course {
  id: string
  name: string
  department: string
  credits: number
  instructor: string
  timing: string
  location: string
  prerequisites: string[]
  offeredThisSem: boolean
  registered: boolean
  description?: string
  syllabus?: string[]
}

/**
 * Register for a course
 * @param courseId The ID of the course to register for
 * @returns A promise that resolves to the updated course
 */
export async function registerForCourse(courseId: string): Promise<{ success: boolean; message: string }> {
  console.log(`Registering for course ${courseId}`)

  // Check prerequisites
  const prerequisites = await checkPrerequisites(courseId)
  if (!prerequisites.met) {
    return {
      success: false,
      message: `Prerequisites not met: ${prerequisites.missing.join(", ")}`,
    }
  }

  // Check credit limit
  const creditCheck = await checkCreditLimit(courseId)
  if (!creditCheck.allowed) {
    return {
      success: false,
      message: `Registering would exceed credit limit. Current: ${creditCheck.current}, Adding: ${creditCheck.adding}, Max: ${creditCheck.max}`,
    }
  }

  // Check for time conflicts
  const timeCheck = await checkTimeConflicts(courseId)
  if (timeCheck.hasConflicts) {
    return {
      success: false,
      message: `Time conflict with: ${timeCheck.conflictingCourses.join(", ")}`,
    }
  }

  // In a real application, this would make an API call to register for the course
  // For now, we'll just return a success message
  return {
    success: true,
    message: `Successfully registered for ${courseId}`,
  }
}

/**
 * Drop a course
 * @param courseId The ID of the course to drop
 * @returns A promise that resolves to the updated course
 */
export async function dropCourse(courseId: string): Promise<{ success: boolean; message: string }> {
  console.log(`Dropping course ${courseId}`)

  // In a real application, this would make an API call to drop the course
  // For now, we'll just return a success message
  return {
    success: true,
    message: `Successfully dropped ${courseId}`,
  }
}

/**
 * Check if prerequisites are met for a course
 * @param courseId The ID of the course to check prerequisites for
 * @returns A promise that resolves to an object with the result
 */
async function checkPrerequisites(courseId: string): Promise<{ met: boolean; missing: string[] }> {
  // In a real application, this would check the student's course history
  // For now, we'll just return a success message
  return {
    met: true,
    missing: [],
  }
}

/**
 * Check if registering for a course would exceed the credit limit
 * @param courseId The ID of the course to check
 * @returns A promise that resolves to an object with the result
 */
async function checkCreditLimit(courseId: string): Promise<{
  allowed: boolean
  current: number
  adding: number
  max: number
}> {
  // In a real application, this would check the student's current credits
  // For now, we'll just return a success message
  return {
    allowed: true,
    current: 18,
    adding: 4,
    max: 25,
  }
}

/**
 * Check if registering for a course would create time conflicts
 * @param courseId The ID of the course to check
 * @returns A promise that resolves to an object with the result
 */
async function checkTimeConflicts(courseId: string): Promise<{
  hasConflicts: boolean
  conflictingCourses: string[]
}> {
  // In a real application, this would check the student's current schedule
  // For now, we'll just return a success message
  return {
    hasConflicts: false,
    conflictingCourses: [],
  }
}

/**
 * Get all courses
 * @returns A promise that resolves to an array of courses
 */
export async function getAllCourses(): Promise<Course[]> {
  // In a real application, this would make an API call to get all courses
  // For now, we'll just return some sample data
  return [
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
    // Add more courses as needed
  ]
}

/**
 * Get a course by ID
 * @param courseId The ID of the course to get
 * @returns A promise that resolves to the course
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  // In a real application, this would make an API call to get the course
  // For now, we'll just return some sample data
  const courses = await getAllCourses()
  return courses.find((course) => course.id === courseId) || null
}

