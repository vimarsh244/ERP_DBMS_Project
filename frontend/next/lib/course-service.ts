import supabase from "./supabase"
import type { Database } from "./database.types"

export type Course = Database["public"]["Tables"]["courses"]["Row"]
export type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"]
export type CourseUpdate = Database["public"]["Tables"]["courses"]["Update"]

export type CourseOffering = Database["public"]["Tables"]["course_offerings"]["Row"] & {
  course_name?: string
  professor_name?: string
  department?: string
  credits?: number
  schedules?: CourseSchedule[]
  enrolled_count?: number
}

export type CourseSchedule = Database["public"]["Tables"]["course_schedules"]["Row"]
export type Prerequisite = Database["public"]["Tables"]["prerequisites"]["Row"] & {
  prerequisite_name?: string
}

export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"] & {
  student_name?: string
  course_name?: string
}

/**
 * Register for a course
 * @param studentId The ID of the student
 * @param courseOfferingId The ID of the course offering to register for
 * @returns A promise that resolves to the result of the registration
 */
export async function registerForCourse(
  studentId: string,
  courseOfferingId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Check prerequisites
    const prerequisites = await checkPrerequisites(studentId, courseOfferingId)
    if (!prerequisites.met) {
      return {
        success: false,
        message: `Prerequisites not met: ${prerequisites.missing.map((p) => p.name).join(", ")}`,
      }
    }

    // Check credit limit
    const creditCheck = await checkCreditLimit(studentId, courseOfferingId)
    if (!creditCheck.allowed) {
      return {
        success: false,
        message: `Registering would exceed credit limit. Current: ${creditCheck.current}, Adding: ${creditCheck.adding}, Max: ${creditCheck.max}`,
      }
    }

    // Check for time conflicts
    const timeCheck = await checkTimeConflicts(studentId, courseOfferingId)
    if (timeCheck.hasConflicts) {
      return {
        success: false,
        message: `Time conflict with: ${timeCheck.conflictingCourses.map((c) => `${c.name} (${c.day} ${c.time})`).join(", ")}`,
      }
    }

    // Enroll the student
    const { error } = await supabase.from("enrollments").insert({
      student_id: studentId,
      course_offering_id: courseOfferingId,
      status: "enrolled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return {
      success: true,
      message: `Successfully registered for the course`,
    }
  } catch (error) {
    console.error("Error registering for course:", error)
    return {
      success: false,
      message: "An error occurred during registration",
    }
  }
}

/**
 * Drop a course
 * @param studentId The ID of the student
 * @param courseOfferingId The ID of the course offering to drop
 * @returns A promise that resolves to the result of dropping the course
 */
export async function dropCourse(
  studentId: string,
  courseOfferingId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("student_id", studentId)
      .eq("course_offering_id", courseOfferingId)

    if (error) throw error

    return {
      success: true,
      message: `Successfully dropped the course`,
    }
  } catch (error) {
    console.error("Error dropping course:", error)
    return {
      success: false,
      message: "An error occurred while dropping the course",
    }
  }
}

// Create a new course
export async function createCourse(data: CourseInsert): Promise<Course> {
  try {
    const insertData = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: newCourse, error } = await supabase.from("courses").insert(insertData).select().single()

    if (error) throw error
    return newCourse
  } catch (error) {
    console.error("Error creating course:", error)
    throw error
  }
}

// Get all courses
export async function getAllCourses(): Promise<Course[]> {
  try {
    const { data, error } = await supabase.from("courses").select("*").order("department").order("id")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching courses:", error)
    throw error
  }
}

// Get course by ID
export async function getCourseById(id: string): Promise<Course | null> {
  try {
    const { data, error } = await supabase.from("courses").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // No rows returned
      throw error
    }

    return data
  } catch (error) {
    console.error("Error fetching course:", error)
    throw error
  }
}

// Update course
export async function updateCourse(id: string, data: CourseUpdate): Promise<Course | null> {
  try {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedCourse, error } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return updatedCourse
  } catch (error) {
    console.error("Error updating course:", error)
    throw error
  }
}

// Delete course
export async function deleteCourse(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error deleting course:", error)
    throw error
  }
}

// Add prerequisite to a course
export async function addPrerequisite(
  courseId: string,
  prerequisiteId: string,
  minGrade?: string,
): Promise<Prerequisite> {
  try {
    const { data, error } = await supabase
      .from("prerequisites")
      .insert({
        course_id: courseId,
        prerequisite_id: prerequisiteId,
        min_grade: minGrade,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error adding prerequisite:", error)
    throw error
  }
}

// Remove prerequisite from a course
export async function removePrerequisite(courseId: string, prerequisiteId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("prerequisites")
      .delete()
      .eq("course_id", courseId)
      .eq("prerequisite_id", prerequisiteId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error removing prerequisite:", error)
    throw error
  }
}

// Get prerequisites for a course
export async function getPrerequisitesForCourse(courseId: string): Promise<Prerequisite[]> {
  try {
    // First get the prerequisites
    const { data: prerequisites, error } = await supabase.from("prerequisites").select("*").eq("course_id", courseId)

    if (error) throw error

    // Then get the course names for each prerequisite
    const result: Prerequisite[] = []

    for (const prereq of prerequisites || []) {
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("name")
        .eq("id", prereq.prerequisite_id)
        .single()

      if (courseError && courseError.code !== "PGRST116") throw courseError

      result.push({
        ...prereq,
        prerequisite_name: course?.name,
      })
    }

    return result
  } catch (error) {
    console.error("Error fetching prerequisites:", error)
    throw error
  }
}

// Create a new course offering
export async function createCourseOffering(data: any): Promise<CourseOffering> {
  try {
    const insertData = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: newOffering, error } = await supabase.from("course_offerings").insert(insertData).select().single()

    if (error) throw error
    return newOffering
  } catch (error) {
    console.error("Error creating course offering:", error)
    throw error
  }
}

// Get all course offerings with additional details
export async function getAllCourseOfferings(): Promise<CourseOffering[]> {
  try {
    // Get course offerings
    const { data: offerings, error } = await supabase
      .from("course_offerings")
      .select("*")
      .order("year", { ascending: false })
      .order("semester")

    if (error) throw error

    // Enhance with additional data
    const result: CourseOffering[] = []

    for (const offering of offerings || []) {
      // Get course details
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("name, department, credits")
        .eq("id", offering.course_id)
        .single()

      if (courseError && courseError.code !== "PGRST116") throw courseError

      // Get professor name
      let professorName = null
      if (offering.professor_id) {
        const { data: professor, error: professorError } = await supabase
          .from("users")
          .select("name")
          .eq("id", offering.professor_id)
          .single()

        if (professorError && professorError.code !== "PGRST116") throw professorError
        professorName = professor?.name
      }

      // Get enrollment count
      const { count: enrolledCount, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_offering_id", offering.id)

      if (enrollmentError) throw enrollmentError

      // Get schedules
      const { data: schedules, error: schedulesError } = await supabase
        .from("course_schedules")
        .select("*")
        .eq("course_offering_id", offering.id)
        .order("day_of_week")
        .order("start_time")

      if (schedulesError) throw schedulesError

      result.push({
        ...offering,
        course_name: course?.name,
        department: course?.department,
        credits: course?.credits,
        professor_name: professorName,
        enrolled_count: enrolledCount || 0,
        schedules: schedules || [],
      })
    }

    return result
  } catch (error) {
    console.error("Error fetching course offerings:", error)
    throw error
  }
}

// Get course offering by ID with additional details
export async function getCourseOfferingById(id: string): Promise<CourseOffering | null> {
  try {
    // Get course offering
    const { data: offering, error } = await supabase.from("course_offerings").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // No rows returned
      throw error
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("name, department, credits")
      .eq("id", offering.course_id)
      .single()

    if (courseError && courseError.code !== "PGRST116") throw courseError

    // Get professor name
    let professorName = null
    if (offering.professor_id) {
      const { data: professor, error: professorError } = await supabase
        .from("users")
        .select("name")
        .eq("id", offering.professor_id)
        .single()

      if (professorError && professorError.code !== "PGRST116") throw professorError
      professorName = professor?.name
    }

    // Get enrollment count
    const { count: enrolledCount, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("course_offering_id", offering.id)

    if (enrollmentError) throw enrollmentError

    // Get schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from("course_schedules")
      .select("*")
      .eq("course_offering_id", offering.id)
      .order("day_of_week")
      .order("start_time")

    if (schedulesError) throw schedulesError

    return {
      ...offering,
      course_name: course?.name,
      department: course?.department,
      credits: course?.credits,
      professor_name: professorName,
      enrolled_count: enrolledCount || 0,
      schedules: schedules || [],
    }
  } catch (error) {
    console.error("Error fetching course offering:", error)
    throw error
  }
}

// Add schedule to a course offering
export async function addCourseSchedule(data: any): Promise<CourseSchedule> {
  try {
    const { data: newSchedule, error } = await supabase.from("course_schedules").insert(data).select().single()

    if (error) throw error
    return newSchedule
  } catch (error) {
    console.error("Error adding course schedule:", error)
    throw error
  }
}

// Remove schedule from a course offering
export async function removeCourseSchedule(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("course_schedules").delete().eq("id", id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error removing course schedule:", error)
    throw error
  }
}

// Enroll a student in a course
export async function enrollStudent(studentId: string, courseOfferingId: string): Promise<Enrollment> {
  try {
    const enrollmentData = {
      student_id: studentId,
      course_offering_id: courseOfferingId,
      status: "enrolled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: enrollment, error } = await supabase.from("enrollments").insert(enrollmentData).select().single()

    if (error) throw error
    return enrollment
  } catch (error) {
    console.error("Error enrolling student:", error)
    throw error
  }
}

// Drop a course enrollment
export async function dropEnrollment(studentId: string, courseOfferingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("student_id", studentId)
      .eq("course_offering_id", courseOfferingId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error dropping enrollment:", error)
    throw error
  }
}

// Get enrollments for a student
export async function getEnrollmentsForStudent(studentId: string): Promise<Enrollment[]> {
  try {
    // Get enrollments
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Enhance with course names
    const result: Enrollment[] = []

    for (const enrollment of enrollments || []) {
      // Get course offering
      const { data: offering, error: offeringError } = await supabase
        .from("course_offerings")
        .select("course_id")
        .eq("id", enrollment.course_offering_id)
        .single()

      if (offeringError && offeringError.code !== "PGRST116") throw offeringError

      // Get course name
      let courseName = null
      if (offering) {
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("name")
          .eq("id", offering.course_id)
          .single()

        if (courseError && courseError.code !== "PGRST116") throw courseError
        courseName = course?.name
      }

      result.push({
        ...enrollment,
        course_name: courseName,
      })
    }

    return result
  } catch (error) {
    console.error("Error fetching student enrollments:", error)
    throw error
  }
}

// Get enrollments for a course offering
export async function getEnrollmentsForCourseOffering(courseOfferingId: string): Promise<Enrollment[]> {
  try {
    // Get enrollments
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("course_offering_id", courseOfferingId)

    if (error) throw error

    // Enhance with student names
    const result: Enrollment[] = []

    for (const enrollment of enrollments || []) {
      // Get student name
      const { data: student, error: studentError } = await supabase
        .from("users")
        .select("name")
        .eq("id", enrollment.student_id)
        .single()

      if (studentError && studentError.code !== "PGRST116") throw studentError

      result.push({
        ...enrollment,
        student_name: student?.name,
      })
    }

    // Sort by student name
    result.sort((a, b) => {
      if (a.student_name && b.student_name) {
        return a.student_name.localeCompare(b.student_name)
      }
      return 0
    })

    return result
  } catch (error) {
    console.error("Error fetching course enrollments:", error)
    throw error
  }
}

// Check if a student has completed prerequisites for a course
export async function checkPrerequisites(
  studentId: string,
  courseOfferingId: string,
): Promise<{
  met: boolean
  missing: { id: string; name: string }[]
}> {
  try {
    // Get course ID from offering
    const { data: offering, error: offeringError } = await supabase
      .from("course_offerings")
      .select("course_id")
      .eq("id", courseOfferingId)
      .single()

    if (offeringError) throw offeringError

    // Get prerequisites for the course
    const prerequisites = await getPrerequisitesForCourse(offering.course_id)

    if (prerequisites.length === 0) {
      return { met: true, missing: [] }
    }

    // Get completed courses for the student
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_offering_id, grade")
      .eq("student_id", studentId)
      .eq("status", "completed")
      .not("grade", "is", null)
      .not("grade", "in", '("F", "D-", "D")')

    if (enrollmentsError) throw enrollmentsError

    // Get course IDs from offerings
    const completedCourseIds: string[] = []

    for (const enrollment of enrollments || []) {
      const { data: completedOffering, error: completedOfferingError } = await supabase
        .from("course_offerings")
        .select("course_id")
        .eq("id", enrollment.course_offering_id)
        .single()

      if (completedOfferingError && completedOfferingError.code !== "PGRST116") throw completedOfferingError

      if (completedOffering) {
        completedCourseIds.push(completedOffering.course_id)
      }
    }

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
    const { data: newSchedules, error: newSchedulesError } = await supabase
      .from("course_schedules")
      .select("*")
      .eq("course_offering_id", courseOfferingId)

    if (newSchedulesError) throw newSchedulesError

    if (!newSchedules || newSchedules.length === 0) {
      return { hasConflicts: false, conflictingCourses: [] }
    }

    // Get current enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_offering_id")
      .eq("student_id", studentId)
      .eq("status", "enrolled")

    if (enrollmentsError) throw enrollmentsError

    // Check for conflicts
    const conflicts: { id: string; name: string; day: string; time: string }[] = []

    for (const enrollment of enrollments || []) {
      // Skip if it's the same course offering
      if (enrollment.course_offering_id === courseOfferingId) continue

      // Get schedules for this enrollment
      const { data: currentSchedules, error: currentSchedulesError } = await supabase
        .from("course_schedules")
        .select("*")
        .eq("course_offering_id", enrollment.course_offering_id)

      if (currentSchedulesError) throw currentSchedulesError

      // Get course details
      const { data: currentOffering, error: currentOfferingError } = await supabase
        .from("course_offerings")
        .select("course_id")
        .eq("id", enrollment.course_offering_id)
        .single()

      if (currentOfferingError && currentOfferingError.code !== "PGRST116") throw currentOfferingError

      let courseName = currentOffering?.course_id || ""

      if (currentOffering) {
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("name")
          .eq("id", currentOffering.course_id)
          .single()

        if (courseError && courseError.code !== "PGRST116") throw courseError

        if (course) {
          courseName = course.name
        }
      }

      // Check for time conflicts
      for (const newSchedule of newSchedules) {
        for (const currentSchedule of currentSchedules || []) {
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
              id: currentOffering?.course_id || "",
              name: courseName,
              day: currentSchedule.day_of_week,
              time: `${currentSchedule.start_time.substring(0, 5)} - ${currentSchedule.end_time.substring(0, 5)}`,
            })
            break // No need to check other schedules for this course
          }
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
    // Get current enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_offering_id")
      .eq("student_id", studentId)
      .eq("status", "enrolled")

    if (enrollmentsError) throw enrollmentsError

    // Calculate current credits
    let currentCredits = 0

    for (const enrollment of enrollments || []) {
      const { data: offering, error: offeringError } = await supabase
        .from("course_offerings")
        .select("course_id")
        .eq("id", enrollment.course_offering_id)
        .single()

      if (offeringError && offeringError.code !== "PGRST116") throw offeringError

      if (offering) {
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("credits")
          .eq("id", offering.course_id)
          .single()

        if (courseError && courseError.code !== "PGRST116") throw courseError

        if (course) {
          currentCredits += course.credits
        }
      }
    }

    // Get credits for the new course
    const { data: newOffering, error: newOfferingError } = await supabase
      .from("course_offerings")
      .select("course_id")
      .eq("id", courseOfferingId)
      .single()

    if (newOfferingError) throw newOfferingError

    const { data: newCourse, error: newCourseError } = await supabase
      .from("courses")
      .select("credits")
      .eq("id", newOffering.course_id)
      .single()

    if (newCourseError) throw newCourseError

    const newCourseCredits = newCourse.credits
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

