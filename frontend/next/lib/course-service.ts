import { executeQuery } from "@/lib/db"

export interface Course {
  id: string
  name: string
  department: string
  description: string
  credits: number
  created_at: string
  updated_at: string
}

export interface CourseOffering {
  id: string
  course_id: string
  professor_id: string
  semester: string
  year: number
  max_students: number
  location: string
  created_at: string
  updated_at: string
  course_name?: string
  professor_name?: string
  department?: string
  credits?: number
  schedules?: CourseSchedule[]
  enrolled_count?: number
}

export interface CourseSchedule {
  id: string
  course_offering_id: string
  day_of_week: string
  start_time: string
  end_time: string
}

export interface Prerequisite {
  course_id: string
  prerequisite_id: string
  prerequisite_name?: string
}

export interface Enrollment {
  student_id: string
  course_offering_id: string
  status: string
  grade: string | null
  created_at: string
  updated_at: string
  student_name?: string
  course_name?: string
}

/**
 * Register for a course
 * @param courseId The ID of the course to register for
 * @returns A promise that resolves to the updated course
 */
export async function registerForCourse(courseId: string): Promise<{ success: boolean; message: string }> {
  console.log(`Registering for course ${courseId}`)

  // Check prerequisites
  // const prerequisites = await checkPrerequisites(courseId)
  // if (!prerequisites.met) {
  //   return {
  //     success: false,
  //     message: `Prerequisites not met: ${prerequisites.missing.join(", ")}`,
  //   }
  // }

  // // Check credit limit
  // const creditCheck = await checkCreditLimit(courseId)
  // if (!creditCheck.allowed) {
  //   return {
  //     success: false,
  //     message: `Registering would exceed credit limit. Current: ${creditCheck.current}, Adding: ${creditCheck.adding}, Max: ${creditCheck.max}`,
  //   }
  // }

  // // Check for time conflicts
  // const timeCheck = await checkTimeConflicts(courseId)
  // if (timeCheck.hasConflicts) {
  //   return {
  //     success: false,
  //     message: `Time conflict with: ${timeCheck.conflictingCourses.join(", ")}`,
  //   }
  // }

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

// Create a new course
export async function createCourse(data: {
  id: string
  name: string
  department: string
  description: string
  credits: number
}): Promise<Course> {
  try {
    const result = await executeQuery(
      `INSERT INTO courses (id, name, department, description, credits) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [data.id, data.name, data.department, data.description, data.credits],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating course:", error)
    throw error
  }
}

// Get all courses
export async function getAllCourses(): Promise<Course[]> {
  try {
    const result = await executeQuery("SELECT * FROM courses ORDER BY department, id")

    return result.rows
  } catch (error) {
    console.error("Error fetching courses:", error)
    throw error
  }
}

// Get course by ID
export async function getCourseById(id: string): Promise<Course | null> {
  try {
    const result = await executeQuery("SELECT * FROM courses WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error fetching course:", error)
    throw error
  }
}

// Update course
export async function updateCourse(
  id: string,
  data: {
    name?: string
    department?: string
    description?: string
    credits?: number
  },
): Promise<Course | null> {
  try {
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(data.name)
    }

    if (data.department !== undefined) {
      updates.push(`department = $${paramIndex++}`)
      values.push(data.department)
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(data.description)
    }

    if (data.credits !== undefined) {
      updates.push(`credits = $${paramIndex++}`)
      values.push(data.credits)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    values.push(id)

    const query = `
      UPDATE courses 
      SET ${updates.join(", ")} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `

    const result = await executeQuery(query, values)

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error updating course:", error)
    throw error
  }
}

// Delete course
export async function deleteCourse(id: string): Promise<boolean> {
  try {
    const result = await executeQuery("DELETE FROM courses WHERE id = $1 RETURNING id", [id])

    return result.rows.length > 0
  } catch (error) {
    console.error("Error deleting course:", error)
    throw error
  }
}

// Add prerequisite to a course
export async function addPrerequisite(courseId: string, prerequisiteId: string): Promise<Prerequisite> {
  try {
    const result = await executeQuery(
      `INSERT INTO prerequisites (course_id, prerequisite_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [courseId, prerequisiteId],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error adding prerequisite:", error)
    throw error
  }
}

// Remove prerequisite from a course
export async function removePrerequisite(courseId: string, prerequisiteId: string): Promise<boolean> {
  try {
    const result = await executeQuery(
      "DELETE FROM prerequisites WHERE course_id = $1 AND prerequisite_id = $2 RETURNING course_id",
      [courseId, prerequisiteId],
    )

    return result.rows.length > 0
  } catch (error) {
    console.error("Error removing prerequisite:", error)
    throw error
  }
}

// Get prerequisites for a course
export async function getPrerequisitesForCourse(courseId: string): Promise<Prerequisite[]> {
  try {
    const result = await executeQuery(
      `SELECT p.*, c.name as prerequisite_name 
       FROM prerequisites p
       JOIN courses c ON p.prerequisite_id = c.id
       WHERE p.course_id = $1`,
      [courseId],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching prerequisites:", error)
    throw error
  }
}

// Create a new course offering
export async function createCourseOffering(data: {
  course_id: string
  professor_id: string
  semester: string
  year: number
  max_students: number
  location: string
}): Promise<CourseOffering> {
  try {
    const result = await executeQuery(
      `INSERT INTO course_offerings (course_id, professor_id, semester, year, max_students, location) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [data.course_id, data.professor_id, data.semester, data.year, data.max_students, data.location],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating course offering:", error)
    throw error
  }
}

// Get all course offerings with additional details
export async function getAllCourseOfferings(): Promise<CourseOffering[]> {
  try {
    const result = await executeQuery(
      `SELECT co.*, 
              c.name as course_name, 
              c.department, 
              c.credits,
              u.name as professor_name,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_offering_id = co.id) as enrolled_count
       FROM course_offerings co
       JOIN courses c ON co.course_id = c.id
       LEFT JOIN users u ON co.professor_id = u.id
       ORDER BY co.year DESC, co.semester, c.department, c.id`,
    )

    const offerings = result.rows

    // Get schedules for each offering
    for (const offering of offerings) {
      const schedules = await executeQuery(
        "SELECT * FROM course_schedules WHERE course_offering_id = $1 ORDER BY day_of_week, start_time",
        [offering.id],
      )

      offering.schedules = schedules.rows
    }

    return offerings
  } catch (error) {
    console.error("Error fetching course offerings:", error)
    throw error
  }
}

// Get course offering by ID with additional details
export async function getCourseOfferingById(id: string): Promise<CourseOffering | null> {
  try {
    const result = await executeQuery(
      `SELECT co.*, 
              c.name as course_name, 
              c.department, 
              c.credits,
              u.name as professor_name,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_offering_id = co.id) as enrolled_count
       FROM course_offerings co
       JOIN courses c ON co.course_id = c.id
       LEFT JOIN users u ON co.professor_id = u.id
       WHERE co.id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    const offering = result.rows[0]

    // Get schedules
    const schedules = await executeQuery(
      "SELECT * FROM course_schedules WHERE course_offering_id = $1 ORDER BY day_of_week, start_time",
      [id],
    )

    offering.schedules = schedules.rows

    return offering
  } catch (error) {
    console.error("Error fetching course offering:", error)
    throw error
  }
}

// Add schedule to a course offering
export async function addCourseSchedule(data: {
  course_offering_id: string
  day_of_week: string
  start_time: string
  end_time: string
}): Promise<CourseSchedule> {
  try {
    const result = await executeQuery(
      `INSERT INTO course_schedules (course_offering_id, day_of_week, start_time, end_time) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [data.course_offering_id, data.day_of_week, data.start_time, data.end_time],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error adding course schedule:", error)
    throw error
  }
}

// Remove schedule from a course offering
export async function removeCourseSchedule(id: string): Promise<boolean> {
  try {
    const result = await executeQuery("DELETE FROM course_schedules WHERE id = $1 RETURNING id", [id])

    return result.rows.length > 0
  } catch (error) {
    console.error("Error removing course schedule:", error)
    throw error
  }
}

// Enroll a student in a course
export async function enrollStudent(studentId: string, courseOfferingId: string): Promise<Enrollment> {
  try {
    const result = await executeQuery(
      `INSERT INTO enrollments (student_id, course_offering_id, status) 
       VALUES ($1, $2, 'enrolled') 
       RETURNING *`,
      [studentId, courseOfferingId],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error enrolling student:", error)
    throw error
  }
}

// Drop a course enrollment
export async function dropEnrollment(studentId: string, courseOfferingId: string): Promise<boolean> {
  try {
    const result = await executeQuery(
      "DELETE FROM enrollments WHERE student_id = $1 AND course_offering_id = $2 RETURNING student_id",
      [studentId, courseOfferingId],
    )

    return result.rows.length > 0
  } catch (error) {
    console.error("Error dropping enrollment:", error)
    throw error
  }
}

// Get enrollments for a student
export async function getEnrollmentsForStudent(studentId: string): Promise<Enrollment[]> {
  try {
    const result = await executeQuery(
      `SELECT e.*, 
              c.name as course_name
       FROM enrollments e
       JOIN course_offerings co ON e.course_offering_id = co.id
       JOIN courses c ON co.course_id = c.id
       WHERE e.student_id = $1
       ORDER BY e.created_at DESC`,
      [studentId],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching student enrollments:", error)
    throw error
  }
}

// Get enrollments for a course offering
export async function getEnrollmentsForCourseOffering(courseOfferingId: string): Promise<Enrollment[]> {
  try {
    const result = await executeQuery(
      `SELECT e.*, 
              u.name as student_name
       FROM enrollments e
       JOIN users u ON e.student_id = u.id
       WHERE e.course_offering_id = $1
       ORDER BY u.name`,
      [courseOfferingId],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching course enrollments:", error)
    throw error
  }
}

// Check if a student has completed prerequisites for a course
export async function checkPrerequisites(
  studentId: string,
  courseId: string,
): Promise<{
  met: boolean
  missing: { id: string; name: string }[]
}> {
  try {
    // Get prerequisites for the course
    const prerequisites = await getPrerequisitesForCourse(courseId)

    if (prerequisites.length === 0) {
      return { met: true, missing: [] }
    }

    // Get completed courses for the student
    const completedCoursesResult = await executeQuery(
      `SELECT DISTINCT c.id, c.name
       FROM enrollments e
       JOIN course_offerings co ON e.course_offering_id = co.id
       JOIN courses c ON co.course_id = c.id
       WHERE e.student_id = $1 AND e.status = 'completed' AND (e.grade IS NULL OR e.grade NOT IN ('F', 'D-', 'D'))`,
      [studentId],
    )

    const completedCourses = completedCoursesResult.rows
    const completedCourseIds = completedCourses.map((c) => c.id)

    // Check which prerequisites are missing
    const missingPrerequisites = prerequisites
      .filter((p) => !completedCourseIds.includes(p.prerequisite_id))
      .map((p) => ({
        id: p.prerequisite_id,
        name: p.prerequisite_name || p.prerequisite_id,
      }))

    return {
      met: missingPrerequisites.length === 0,
      missing: missingPrerequisites,
    }
  } catch (error) {
    console.error("Error checking prerequisites:", error)
    throw error
  }
}

// Check for time conflicts
export async function checkTimeConflicts(
  studentId: string,
  courseOfferingId: string,
): Promise<{
  hasConflicts: boolean
  conflictingCourses: { id: string; name: string; day: string; time: string }[]
}> {
  try {
    // Get schedules for the course offering
    const schedulesResult = await executeQuery(
      `SELECT cs.* 
       FROM course_schedules cs
       WHERE cs.course_offering_id = $1`,
      [courseOfferingId],
    )

    const schedules = schedulesResult.rows

    if (schedules.length === 0) {
      return { hasConflicts: false, conflictingCourses: [] }
    }

    // Get current enrollments and their schedules
    const currentEnrollmentsResult = await executeQuery(
      `SELECT co.id as offering_id, 
              c.id as course_id, 
              c.name as course_name, 
              cs.day_of_week, 
              cs.start_time, 
              cs.end_time
       FROM enrollments e
       JOIN course_offerings co ON e.course_offering_id = co.id
       JOIN courses c ON co.course_id = c.id
       JOIN course_schedules cs ON cs.course_offering_id = co.id
       WHERE e.student_id = $1 AND e.status = 'enrolled'`,
      [studentId],
    )

    const currentSchedules = currentEnrollmentsResult.rows

    // Check for conflicts
    const conflicts: { id: string; name: string; day: string; time: string }[] = []

    for (const newSchedule of schedules) {
      for (const currentSchedule of currentSchedules) {
        // Skip if different days
        if (newSchedule.day_of_week !== currentSchedule.day_of_week) {
          continue
        }

        // Check for time overlap
        const newStart = new Date(`1970-01-01T${newSchedule.start_time}`)
        const newEnd = new Date(`1970-01-01T${newSchedule.end_time}`)
        const currentStart = new Date(`1970-01-01T${currentSchedule.start_time}`)
        const currentEnd = new Date(`1970-01-01T${currentSchedule.end_time}`)

        if (
          (newStart >= currentStart && newStart < currentEnd) ||
          (newEnd > currentStart && newEnd <= currentEnd) ||
          (newStart <= currentStart && newEnd >= currentEnd)
        ) {
          conflicts.push({
            id: currentSchedule.course_id,
            name: currentSchedule.course_name,
            day: currentSchedule.day_of_week,
            time: `${currentSchedule.start_time} - ${currentSchedule.end_time}`,
          })
          break // No need to check other schedules for this course
        }
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflictingCourses: conflicts,
    }
  } catch (error) {
    console.error("Error checking time conflicts:", error)
    throw error
  }
}

// Check credit limit
export async function checkCreditLimit(
  studentId: string,
  courseOfferingId: string,
): Promise<{
  allowed: boolean
  current: number
  adding: number
  max: number
}> {
  try {
    // Get current credits
    const currentCreditsResult = await executeQuery(
      `SELECT SUM(c.credits) as total_credits
       FROM enrollments e
       JOIN course_offerings co ON e.course_offering_id = co.id
       JOIN courses c ON co.course_id = c.id
       WHERE e.student_id = $1 AND e.status = 'enrolled'`,
      [studentId],
    )

    const currentCredits = Number.parseInt(currentCreditsResult.rows[0]?.total_credits || "0")

    // Get credits for the new course
    const newCourseCreditsResult = await executeQuery(
      `SELECT c.credits
       FROM course_offerings co
       JOIN courses c ON co.course_id = c.id
       WHERE co.id = $1`,
      [courseOfferingId],
    )

    if (newCourseCreditsResult.rows.length === 0) {
      throw new Error("Course offering not found")
    }

    const newCourseCredits = Number.parseInt(newCourseCreditsResult.rows[0].credits)
    const maxCredits = 25 // Maximum allowed credits

    return {
      allowed: currentCredits + newCourseCredits <= maxCredits,
      current: currentCredits,
      adding: newCourseCredits,
      max: maxCredits,
    }
  } catch (error) {
    console.error("Error checking credit limit:", error)
    throw error
  }
}

