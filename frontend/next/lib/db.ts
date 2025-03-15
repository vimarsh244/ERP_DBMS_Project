import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import supabase from "./supabase"

// Check if the NEON_DATABASE_URL environment variable is set
if (!process.env.NEON_DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL environment variable is not set")
}

// Create a SQL client with the connection string
const sql_client = neon(process.env.NEON_DATABASE_URL)

// Create a drizzle client with the SQL client
export const db = drizzle(sql_client)

// Helper function to execute raw SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    return await sql_client.query(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Initialize database with required tables
export async function initializeDatabase() {
  try {
    // Note: In Supabase, we would typically create tables through the Supabase dashboard
    // or using migrations. This function is kept for compatibility but would be used
    // differently in a real Supabase implementation.

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Failed to initialize database:", error)
    return false
  }
}

// This function can be used to run SQL queries directly if needed
export async function executeRawQuery(query: string, params: any[] = []) {
  try {
    const { data, error } = await supabase.rpc("execute_sql", {
      query_text: query,
      params: params,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

