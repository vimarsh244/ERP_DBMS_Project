import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
// import './../envConfig.ts'
// import {dotenv} from "dotenv"

// console.log("Loading database module")
// console.log("NEON_DATABASE_URL:", process.env.NEON_DATABASE_URL)

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
    
    const response = await sql_client.query(query, params);
    return response.rows[0].version;
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Initialize database with required tables
export async function initializeDatabase() {
  try {
    // Create users table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'student',
        student_id VARCHAR(50) UNIQUE,
        branch VARCHAR(100),
        graduating_year INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create courses table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        description TEXT,
        credits INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create prerequisites table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS prerequisites (
        course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
        prerequisite_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
        PRIMARY KEY (course_id, prerequisite_id)
      )
    `)

    // Create course_offerings table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS course_offerings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
        professor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        semester VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        max_students INTEGER NOT NULL DEFAULT 50,
        location VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create course_schedules table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS course_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_offering_id UUID REFERENCES course_offerings(id) ON DELETE CASCADE,
        day_of_week VARCHAR(10) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL
      )
    `)

    // Create enrollments table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS enrollments (
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        course_offering_id UUID REFERENCES course_offerings(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'enrolled',
        grade VARCHAR(5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (student_id, course_offering_id)
      )
    `)

    // Create announcements table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        course_offering_id UUID REFERENCES course_offerings(id) ON DELETE CASCADE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Failed to initialize database:", error)
    return false
  }
}

