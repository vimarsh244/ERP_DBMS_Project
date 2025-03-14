import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare, hash } from "bcryptjs"
import { executeQuery } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "student", // Default role for Google sign-ins
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find user by email
          const result = await executeQuery("SELECT * FROM users WHERE email = $1 LIMIT 1", [credentials.email])

          const user = result.rows[0]

          if (!user || !user.password) {
            return null
          }

          // Compare passwords
          const passwordMatch = await compare(credentials.password, user.password)

          if (!passwordMatch) {
            return null
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            studentId: user.student_id,
            branch: user.branch,
            graduatingYear: user.graduating_year,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.studentId = user.studentId
        token.branch = user.branch
        token.graduatingYear = user.graduatingYear
      }

      // If it's a Google sign-in, check if the user exists in our database
      if (account?.provider === "google") {
        try {
          const result = await executeQuery("SELECT * FROM users WHERE email = $1 LIMIT 1", [token.email])

          if (result.rows.length === 0) {
            // User doesn't exist, create a new user
            const newUser = await executeQuery(
              "INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *",
              [token.name, token.email, "student"],
            )

            token.role = "student"
            token.id = newUser.rows[0].id
          } else {
            // User exists, update token with user data
            const user = result.rows[0]
            token.role = user.role
            token.id = user.id
            token.studentId = user.student_id
            token.branch = user.branch
            token.graduatingYear = user.graduating_year
          }
        } catch (error) {
          console.error("Error handling Google sign-in:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.studentId = token.studentId as string
        session.user.branch = token.branch as string
        session.user.graduatingYear = token.graduatingYear as number
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to create a new user
export async function createUser({
  name,
  email,
  password,
  role = "student",
  studentId = null,
  branch = null,
  graduatingYear = null,
}: {
  name: string
  email: string
  password: string
  role?: string
  studentId?: string | null
  branch?: string | null
  graduatingYear?: number | null
}) {
  try {
    // Check if user already exists
    const existingUser = await executeQuery("SELECT * FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const result = await executeQuery(
      `INSERT INTO users (name, email, password, role, student_id, branch, graduating_year) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, name, email, role, student_id, branch, graduating_year`,
      [name, email, hashedPassword, role, studentId, branch, graduatingYear],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

// Helper function to update a user's role
export async function updateUserRole(userId: string, role: string) {
  try {
    const result = await executeQuery(
      "UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [role, userId],
    )

    if (result.rows.length === 0) {
      throw new Error("User not found")
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

// Types for NextAuth
declare module "next-auth" {
  interface User {
    role: string
    studentId?: string
    branch?: string
    graduatingYear?: number
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      studentId?: string
      branch?: string
      graduatingYear?: number
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    id: string
    studentId?: string
    branch?: string
    graduatingYear?: number
  }
}

