import { executeQuery } from "@/lib/db"

export interface SystemSetting {
  id: number
  key: string
  value: string
  updated_at: string
  updated_by: string | null
}

export interface GlobalAnnouncement {
  id: string
  title: string
  content: string
  created_by: string | null
  priority: string
  is_pinned: boolean
  visible_from: string
  visible_until: string | null
  created_at: string
  updated_at: string
  creator_name?: string
}

// Get system setting by key
export async function getSystemSetting(key: string): Promise<SystemSetting | null> {
  try {
    const result = await executeQuery("SELECT * FROM system_settings WHERE key = $1", [key])

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error fetching system setting ${key}:`, error)
    throw error
  }
}

// Update system setting
export async function updateSystemSetting(
  key: string,
  value: string,
  updatedBy: string | null = null,
): Promise<SystemSetting | null> {
  try {
    // Check if setting exists
    const existingResult = await executeQuery("SELECT id FROM system_settings WHERE key = $1", [key])

    if (existingResult.rows.length === 0) {
      // Create new setting
      const result = await executeQuery(
        `INSERT INTO system_settings (key, value, updated_by) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [key, value, updatedBy],
      )

      return result.rows[0]
    } else {
      // Update existing setting
      const result = await executeQuery(
        `UPDATE system_settings 
         SET value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
         WHERE key = $3
         RETURNING *`,
        [value, updatedBy, key],
      )

      return result.rows[0]
    }
  } catch (error) {
    console.error(`Error updating system setting ${key}:`, error)
    throw error
  }
}

// Get all system settings
export async function getAllSystemSettings(): Promise<SystemSetting[]> {
  try {
    const result = await executeQuery("SELECT * FROM system_settings ORDER BY key")

    return result.rows
  } catch (error) {
    console.error("Error fetching system settings:", error)
    throw error
  }
}

// Create a global announcement
export async function createGlobalAnnouncement(data: {
  title: string
  content: string
  created_by: string
  priority?: string
  is_pinned?: boolean
  visible_from?: string
  visible_until?: string | null
}): Promise<GlobalAnnouncement> {
  try {
    const result = await executeQuery(
      `INSERT INTO global_announcements (
        title, content, created_by, priority, is_pinned, visible_from, visible_until
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        data.title,
        data.content,
        data.created_by,
        data.priority || "normal",
        data.is_pinned || false,
        data.visible_from || new Date().toISOString(),
        data.visible_until,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating global announcement:", error)
    throw error
  }
}

// Get all global announcements
export async function getAllGlobalAnnouncements(): Promise<GlobalAnnouncement[]> {
  try {
    const result = await executeQuery(
      `SELECT a.*, u.name as creator_name
       FROM global_announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE (a.visible_until IS NULL OR a.visible_until > CURRENT_TIMESTAMP)
       AND a.visible_from <= CURRENT_TIMESTAMP
       ORDER BY a.is_pinned DESC, a.created_at DESC`,
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching global announcements:", error)
    throw error
  }
}

// Get global announcement by ID
export async function getGlobalAnnouncementById(id: string): Promise<GlobalAnnouncement | null> {
  try {
    const result = await executeQuery(
      `SELECT a.*, u.name as creator_name
       FROM global_announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error fetching global announcement:", error)
    throw error
  }
}

// Update global announcement
export async function updateGlobalAnnouncement(
  id: string,
  data: {
    title?: string
    content?: string
    priority?: string
    is_pinned?: boolean
    visible_from?: string
    visible_until?: string | null
  },
): Promise<GlobalAnnouncement | null> {
  try {
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(data.title)
    }

    if (data.content !== undefined) {
      updates.push(`content = $${paramIndex++}`)
      values.push(data.content)
    }

    if (data.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`)
      values.push(data.priority)
    }

    if (data.is_pinned !== undefined) {
      updates.push(`is_pinned = $${paramIndex++}`)
      values.push(data.is_pinned)
    }

    if (data.visible_from !== undefined) {
      updates.push(`visible_from = $${paramIndex++}`)
      values.push(data.visible_from)
    }

    if (data.visible_until !== undefined) {
      updates.push(`visible_until = $${paramIndex++}`)
      values.push(data.visible_until)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    values.push(id)

    const query = `
      UPDATE global_announcements 
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
    console.error("Error updating global announcement:", error)
    throw error
  }
}

// Delete global announcement
export async function deleteGlobalAnnouncement(id: string): Promise<boolean> {
  try {
    const result = await executeQuery("DELETE FROM global_announcements WHERE id = $1 RETURNING id", [id])

    return result.rows.length > 0
  } catch (error) {
    console.error("Error deleting global announcement:", error)
    throw error
  }
}
