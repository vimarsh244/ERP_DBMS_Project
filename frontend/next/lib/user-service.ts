import supabase from "./supabase"
import type { Database } from "./database.types"

export type User = Database["public"]["Tables"]["users"]["Row"]
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // No rows returned
      throw error
    }

    return data
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      if (error.code === "PGRST116") return null // No rows returned
      throw error
    }

    return data
  } catch (error) {
    console.error("Error fetching user by email:", error)
    throw error
  }
}

// Update user
export async function updateUser(id: string, data: UserUpdate): Promise<User | null> {
  try {
    // Add updated_at timestamp
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedUser, error } = await supabase.from("users").update(updateData).eq("id", id).select().single()

    if (error) throw error
    return updatedUser
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Create user
export async function createUser(data: UserInsert): Promise<User> {
  try {
    // Add timestamps
    const insertData = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: newUser, error } = await supabase.from("users").insert(insertData).select().single()

    if (error) throw error
    return newUser
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

// Delete user
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Get users by role
export async function getUsersByRole(role: string): Promise<User[]> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("role", role).order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching ${role}s:`, error)
    throw error
  }
}

// Get user statistics
export async function getUserStatistics(): Promise<{
  totalUsers: number
  studentCount: number
  professorCount: number
  adminCount: number
  recentUsers: User[]
}> {
  try {
    // Get counts
    const { count: totalCount, error: totalError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (totalError) throw totalError

    const { count: studentCount, error: studentError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")

    if (studentError) throw studentError

    const { count: professorCount, error: professorError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "professor")

    if (professorError) throw professorError

    const { count: adminCount, error: adminError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin")

    if (adminError) throw adminError

    // Get recent users
    const { data: recentUsers, error: recentError } = await supabase
      .from("users")
      .select("id, name, email, role, student_id, branch, graduating_year, profile_picture_url, created_at")
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentError) throw recentError

    return {
      totalUsers: totalCount || 0,
      studentCount: studentCount || 0,
      professorCount: professorCount || 0,
      adminCount: adminCount || 0,
      recentUsers: recentUsers || [],
    }
  } catch (error) {
    console.error("Error fetching user statistics:", error)
    throw error
  }
}

