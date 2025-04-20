import { executeQuery } from "@/lib/db"

export interface Assignment {
  id: string
  course_offering_id: string
  title: string
  description: string | null
  due_date: string
  max_points: number
  created_by: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  course_name?: string
  creator_name?: string
}

export interface AssignmentSubmission {
  id: string
  assignment_id: string
  student_id: string
  submission_text: string | null
  file_path: string | null
  file_name: string | null
  file_type: string | null
  submitted_at: string
  updated_at: string
  grade: number | null
  feedback: string | null
  status: string
  student_name?: string
  student_id_number?: string
}

// Create a new assignment
export async function createAssignment(data: {
  course_offering_id: string
  title: string
  description: string | null
  due_date: string
  max_points: number
  created_by: string
  is_active?: boolean
}): Promise<Assignment> {
  try {
    const result = await executeQuery(
      `INSERT INTO assignments (
        course_offering_id, title, description, due_date, max_points, created_by, is_active
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        data.course_offering_id,
        data.title,
        data.description,
        data.due_date,
        data.max_points,
        data.created_by,
        data.is_active !== undefined ? data.is_active : true,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating assignment:", error)
    throw error
  }
}

// Get all assignments for a course offering
export async function getAssignmentsForCourseOffering(courseOfferingId: string): Promise<Assignment[]> {
  try {
    const result = await executeQuery(
      `SELECT a.*, 
              c.name as course_name, 
              u.name as creator_name
       FROM assignments a
       JOIN course_offerings co ON a.course_offering_id = co.id
       JOIN courses c ON co.course_id = c.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.course_offering_id = $1
       ORDER BY a.due_date ASC`,
      [courseOfferingId],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching course assignments:", error)
    throw error
  }
}

// Get assignment by ID
export async function getAssignmentById(id: string): Promise<Assignment | null> {
  try {
    const result = await executeQuery(
      `SELECT a.*, 
              c.name as course_name, 
              u.name as creator_name
       FROM assignments a
       JOIN course_offerings co ON a.course_offering_id = co.id
       JOIN courses c ON co.course_id = c.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error fetching assignment:", error)
    throw error
  }
}

// Update assignment
export async function updateAssignment(
  id: string,
  data: {
    title?: string
    description?: string | null
    due_date?: string
    max_points?: number
    is_active?: boolean
  },
): Promise<Assignment | null> {
  try {
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(data.title)
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(data.description)
    }

    if (data.due_date !== undefined) {
      updates.push(`due_date = $${paramIndex++}`)
      values.push(data.due_date)
    }

    if (data.max_points !== undefined) {
      updates.push(`max_points = $${paramIndex++}`)
      values.push(data.max_points)
    }

    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`)
      values.push(data.is_active)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    values.push(id)

    const query = `
      UPDATE assignments 
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
    console.error("Error updating assignment:", error)
    throw error
  }
}

// Delete assignment
export async function deleteAssignment(id: string): Promise<boolean> {
  try {
    const result = await executeQuery("DELETE FROM assignments WHERE id = $1 RETURNING id", [id])

    return result.rows.length > 0
  } catch (error) {
    console.error("Error deleting assignment:", error)
    throw error
  }
}

// Get assignments for a student
export async function getAssignmentsForStudent(studentId: string): Promise<Assignment[]> {
  try {
    const result = await executeQuery(
      `SELECT a.*, 
              c.name as course_name, 
              u.name as creator_name
       FROM assignments a
       JOIN course_offerings co ON a.course_offering_id = co.id
       JOIN courses c ON co.course_id = c.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.course_offering_id IN (
         SELECT course_offering_id 
         FROM enrollments 
         WHERE student_id = $1
       )
       ORDER BY a.due_date ASC`,
      [studentId],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching student assignments:", error)
    throw error
  }
}

// Create or update assignment submission
export async function submitAssignment(data: {
  assignment_id: string
  student_id: string
  submission_text?: string | null
  file_path?: string | null
  file_name?: string | null
  file_type?: string | null
}): Promise<AssignmentSubmission> {
  try {
    // Check if submission already exists
    const existingResult = await executeQuery(
      "SELECT id FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2",
      [data.assignment_id, data.student_id],
    )

    if (existingResult.rows.length > 0) {
      // Update existing submission
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      if (data.submission_text !== undefined) {
        updates.push(`submission_text = $${paramIndex++}`)
        values.push(data.submission_text)
      }

      if (data.file_path !== undefined) {
        updates.push(`file_path = $${paramIndex++}`)
        values.push(data.file_path)
      }

      if (data.file_name !== undefined) {
        updates.push(`file_name = $${paramIndex++}`)
        values.push(data.file_name)
      }

      if (data.file_type !== undefined) {
        updates.push(`file_type = $${paramIndex++}`)
        values.push(data.file_type)
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`)
      updates.push(`status = 'submitted'`)

      values.push(data.assignment_id)
      values.push(data.student_id)

      const query = `
        UPDATE assignment_submissions 
        SET ${updates.join(", ")} 
        WHERE assignment_id = $${paramIndex++} AND student_id = $${paramIndex} 
        RETURNING *
      `

      const result = await executeQuery(query, values)
      return result.rows[0]
    } else {
      // Create new submission
      const result = await executeQuery(
        `INSERT INTO assignment_submissions (
          assignment_id, student_id, submission_text, file_path, file_name, file_type, status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, 'submitted') 
        RETURNING *`,
        [data.assignment_id, data.student_id, data.submission_text, data.file_path, data.file_name, data.file_type],
      )

      return result.rows[0]
    }
  } catch (error) {
    console.error("Error submitting assignment:", error)
    throw error
  }
}

// Get submission for a student and assignment
export async function getSubmissionForStudent(
  assignmentId: string,
  studentId: string,
): Promise<AssignmentSubmission | null> {
  try {
    const result = await executeQuery(
      "SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2",
      [assignmentId, studentId],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error fetching submission:", error)
    throw error
  }
}

// Get all submissions for an assignment
export async function getSubmissionsForAssignment(assignmentId: string): Promise<AssignmentSubmission[]> {
  try {
    const result = await executeQuery(
      `SELECT s.*, 
              u.name as student_name,
              u.student_id as student_id_number
       FROM assignment_submissions s
       JOIN users u ON s.student_id = u.id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
      [assignmentId],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching assignment submissions:", error)
    throw error
  }
}

// Grade submission
export async function gradeSubmission(
  assignmentId: string,
  studentId: string,
  data: {
    grade: number
    feedback?: string | null
  },
): Promise<AssignmentSubmission | null> {
  try {
    const result = await executeQuery(
      `UPDATE assignment_submissions 
       SET grade = $1, feedback = $2, status = 'graded', updated_at = CURRENT_TIMESTAMP
       WHERE assignment_id = $3 AND student_id = $4
       RETURNING *`,
      [data.grade, data.feedback, assignmentId, studentId],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error grading submission:", error)
    throw error
  }
}
