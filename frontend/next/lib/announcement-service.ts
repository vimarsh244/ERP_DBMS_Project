import supabase from "./supabase"
import type { Database } from "./database.types"

export type Announcement = Database["public"]["Tables"]["announcements"]["Row"] & {
  course_name?: string
  creator_name?: string
}

// Create a new announcement
export async function createAnnouncement(data: {
  title: string
  content: string
  course_offering_id: string
  created_by: string
  priority?: string
  attachment_urls?: string[]
  is_pinned?: boolean
}): Promise<Announcement> {
  try {
    const insertData = {
      ...data,
      visible_from: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: newAnnouncement, error } = await supabase.from("announcements").insert(insertData).select().single()

    if (error) throw error
    return newAnnouncement
  } catch (error) {
    console.error("Error creating announcement:", error)
    throw error
  }
}

// Get all announcements
export async function getAllAnnouncements(): Promise<Announcement[]> {
  try {
    // Get announcements
    const { data: announcements, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    // Enhance with course and creator names
    const result: Announcement[] = []

    for (const announcement of announcements || []) {
      // Get course name
      const { data: offering, error: offeringError } = await supabase
        .from("course_offerings")
        .select("course_id")
        .eq("id", announcement.course_offering_id)
        .single()

      if (offeringError && offeringError.code !== "PGRST116") throw offeringError

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

      // Get creator name
      let creatorName = null
      if (announcement.created_by) {
        const { data: creator, error: creatorError } = await supabase
          .from("users")
          .select("name")
          .eq("id", announcement.created_by)
          .single()

        if (creatorError && creatorError.code !== "PGRST116") throw creatorError
        creatorName = creator?.name
      }

      result.push({
        ...announcement,
        course_name: courseName,
        creator_name: creatorName,
      })
    }

    return result
  } catch (error) {
    console.error("Error fetching announcements:", error)
    throw error
  }
}

// Get announcements for a course offering
export async function getAnnouncementsForCourseOffering(courseOfferingId: string): Promise<Announcement[]> {
  try {
    // Get announcements
    const { data: announcements, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("course_offering_id", courseOfferingId)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Enhance with course and creator names
    const result: Announcement[] = []

    for (const announcement of announcements || []) {
      // Get course name
      const { data: offering, error: offeringError } = await supabase
        .from("course_offerings")
        .select("course_id")
        .eq("id", announcement.course_offering_id)
        .single()

      if (offeringError && offeringError.code !== "PGRST116") throw offeringError

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

      // Get creator name
      let creatorName = null
      if (announcement.created_by) {
        const { data: creator, error: creatorError } = await supabase
          .from("users")
          .select("name")
          .eq("id", announcement.created_by)
          .single()

        if (creatorError && creatorError.code !== "PGRST116") throw creatorError
        creatorName = creator?.name
      }

      result.push({
        ...announcement,
        course_name: courseName,
        creator_name: creatorName,
      })
    }

    return result
  } catch (error) {
    console.error("Error fetching course announcements:", error)
    throw error
  }
}

// Get announcements for a student
export async function getAnnouncementsForStudent(studentId: string): Promise<Announcement[]> {
  try {
    // Get student's enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_offering_id")
      .eq("student_id", studentId)

    if (enrollmentsError) throw enrollmentsError

    if (!enrollments || enrollments.length === 0) {
      return []
    }

    // Get course offering IDs
    const courseOfferingIds = enrollments.map((e) => e.course_offering_id)

    // Get announcements for these course offerings
    const { data: announcements, error } = await supabase
      .from("announcements")
      .select("*")
      .in("course_offering_id", courseOfferingIds)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Enhance with course and creator names
    const result: Announcement[] = []

    for (const announcement of announcements || []) {
      // Get course name
      const { data: offering, error: offeringError } = await supabase
        .from("course_offerings")
        .select("course_id")
        .eq("id", announcement.course_offering_id)
        .single()

      if (offeringError && offeringError.code !== "PGRST116") throw offeringError

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

      // Get creator name
      let creatorName = null
      if (announcement.created_by) {
        const { data: creator, error: creatorError } = await supabase
          .from("users")
          .select("name")
          .eq("id", announcement.created_by)
          .single()

        if (creatorError && creatorError.code !== "PGRST116") throw creatorError
        creatorName = creator?.name
      }

      result.push({
        ...announcement,
        course_name: courseName,
        creator_name: creatorName,
      })
    }

    return result
  } catch (error) {
    console.error("Error fetching student announcements:", error)
    throw error
  }
}

// Delete announcement
export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("announcements").delete().eq("id", id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error deleting announcement:", error)
    throw error
  }
}

