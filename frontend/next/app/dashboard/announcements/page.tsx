"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { type Announcement, getAnnouncementsForStudent } from "@/lib/announcement-service"

export default function AnnouncementsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user.id) return

    fetchAnnouncements()
  }, [session])

  const fetchAnnouncements = async () => {
    if (!session?.user.id) return

    try {
      setLoading(true)
      const data = await getAnnouncementsForStudent(session.user.id)
      setAnnouncements(data)
    } catch (error) {
      console.error("Error fetching announcements:", error)
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-sm text-muted-foreground">View announcements from your courses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>Announcements from your enrolled courses</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="flex justify-center p-4 text-muted-foreground">No announcements yet</div>
          ) : (
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{announcement.title}</h3>
                    <Badge>{announcement.course_name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Posted by {announcement.creator_name} on {formatDate(announcement.created_at)}
                  </p>
                  <p className="whitespace-pre-line">{announcement.content}</p>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

