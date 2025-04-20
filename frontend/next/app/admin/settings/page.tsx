"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Settings } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getSystemSettingAction, updateSystemSettingAction } from "@/lib/actions"

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [settings, setSettings] = useState({
    registration_open: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    // Redirect if not admin
    if (session && session.user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    fetchSettings()
  }, [session, router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const registrationSetting = await getSystemSettingAction("registration_open")

      setSettings({
        registration_open: registrationSetting ? registrationSetting.value === "true" : true,
      })
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch system settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRegistration = async (checked: boolean) => {
    if (!session?.user?.id) return

    setSaving(true)
    setSaveSuccess(false)

    try {
      await updateSystemSettingAction("registration_open", checked.toString(), session.user.id)

      setSettings({
        ...settings,
        registration_open: checked,
      })

      setSaveSuccess(true)
      toast({
        title: "Settings Updated",
        description: `Course registration is now ${checked ? "enabled" : "disabled"} system-wide.`,
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to update system settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-sm text-muted-foreground">Configure global system settings</p>
        </div>
      </div>

      {saveSuccess && (
        <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Settings have been updated successfully.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registration Settings</CardTitle>
          <CardDescription>Control course registration system-wide</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-4">Loading settings...</div>
          ) : (
            <>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="registration_open" className="text-base">
                    Course Registration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable course registration for all students across the system
                  </p>
                </div>
                <Switch
                  id="registration_open"
                  checked={settings.registration_open}
                  onCheckedChange={handleToggleRegistration}
                  disabled={saving}
                />
              </div>

              <Separator />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  {settings.registration_open
                    ? "Course registration is currently ENABLED. Students can register for courses."
                    : "Course registration is currently DISABLED. Students cannot register for courses."}
                </AlertDescription>
              </Alert>

              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Registration Status</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  When registration is disabled, students will not be able to enroll in any courses, even if individual
                  courses have registration enabled. This is a global override.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
