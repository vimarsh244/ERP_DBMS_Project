import { executeQuery } from "@/lib/db"

export interface Announcement {
  id: string
  title: string
  content: string
  course_offering_id: string
  created_by: string
  created_at: string
  updated_at: string
  course_name?: string
  creator_name?: string
}

// Create a new announcement
export async function createAnnouncement(data: {
  title: string
  content: string
  course_offering_id: string
  created_by: string
}): Promise<Announcement> {
  try {
    const result = await executeQuery(
      `INSERT INTO announcements (title, content, course_offering_id, created_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [data.title, data.content, data.course_offering_id, data.created_by],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating announcement:", error)
    throw error
  }
}

// Get all announcements
export async function getAllAnnouncements(): Promise<Announcement[]> {
  try {
    const result = await executeQuery(
      `SELECT a.*, 
              c.name as course_name, 
              u.name as creator_name
       FROM announcements a
       JOIN course_offerings co ON a.course_offering_id = co.id
       JOIN courses c ON co.course_id = c.id
       JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC`,
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching announcements:", error)
    throw error
  }
}

// Get announcements for a course offering
export async function getAnnouncementsForCourseOffering(courseOfferingId: string): Promise<Announcement[]> {
  try {
    const result = await executeQuery(
      `SELECT a.*, 
              c.name as course_name, 
              u.name as creator_name
       FROM announcements a
       JOIN course_offerings co ON a.course_offering_id = co.id
       JOIN courses c ON co.course_id = c.id
       JOIN users u ON a.created_by = u.id
       WHERE a.course_offering_id = $1
       ORDER BY a.created_at DESC`,
      [courseOfferingId],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching course announcements:", error)
    throw error
  }
}

// Get announcements for a student
export async function getAnnouncementsForStudent(studentId: string): Promise<Announcement[]> {
  try {
    const result = await executeQuery(
      `SELECT DISTINCT a.*, 
                      c.name as course_name, 
                      u.name as creator_name
       FROM announcements a
       JOIN course_offerings co ON a.course_offering_id = co.id
       JOIN courses c ON co.course_id = c.id
       JOIN users u ON a.created_by = u.id
       JOIN enrollments e ON e.course_offering_id = co.id
       WHERE e.student_id = $1
       ORDER BY a.created_at DESC`,
      [studentId],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching student announcements:", error)
    throw error
  }
}

// Delete announcement
export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    const result = await executeQuery("DELETE FROM announcements WHERE id = $1 RETURNING id", [id])

    return result.rows.length > 0
  } catch (error) {
    console.error("Error deleting announcement:", error)
    throw error
  }
}

