import { executeQuery } from "@/lib/db"

export interface User {
  id: string
  name: string
  email: string
  role: string
  student_id?: string
  branch?: string
  graduating_year?: number
  created_at: string
  updated_at: string
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await executeQuery(
      "SELECT id, name, email, role, student_id, branch, graduating_year, created_at, updated_at FROM users ORDER BY created_at DESC",
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await executeQuery(
      "SELECT id, name, email, role, student_id, branch, graduating_year, created_at, updated_at FROM users WHERE id = $1",
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

// Update user
export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    role?: string
    student_id?: string
    branch?: string
    graduating_year?: number
  },
): Promise<User | null> {
  try {
    // Build the SET part of the query dynamically based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(data.name)
    }

    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`)
      values.push(data.email)
    }

    if (data.role !== undefined) {
      updates.push(`role = $${paramIndex++}`)
      values.push(data.role)
    }

    if (data.student_id !== undefined) {
      updates.push(`student_id = $${paramIndex++}`)
      values.push(data.student_id)
    }

    if (data.branch !== undefined) {
      updates.push(`branch = $${paramIndex++}`)
      values.push(data.branch)
    }

    if (data.graduating_year !== undefined) {
      updates.push(`graduating_year = $${paramIndex++}`)
      values.push(data.graduating_year)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    // Add the user ID as the last parameter
    values.push(id)

    const query = `
      UPDATE users 
      SET ${updates.join(", ")} 
      WHERE id = $${paramIndex} 
      RETURNING id, name, email, role, student_id, branch, graduating_year, created_at, updated_at
    `

    const result = await executeQuery(query, values)

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Delete user
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const result = await executeQuery("DELETE FROM users WHERE id = $1 RETURNING id", [id])

    return result.rows.length > 0
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Get users by role
export async function getUsersByRole(role: string): Promise<User[]> {
  try {
    const result = await executeQuery(
      "SELECT id, name, email, role, student_id, branch, graduating_year, created_at, updated_at FROM users WHERE role = $1 ORDER BY name",
      [role],
    )

    return result.rows
  } catch (error) {
    console.error(`Error fetching ${role}s:`, error)
    throw error
  }
}

