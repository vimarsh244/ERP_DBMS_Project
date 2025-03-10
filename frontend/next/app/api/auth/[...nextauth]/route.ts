import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * This is the NextAuth.js API route handler
 * It handles all authentication requests
 */
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

