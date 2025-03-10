"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react"

export default function TimetablePage() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ]

  // This would be fetched from your database in a real application
  const classSchedule = [
    {
      id: "AMP Lec",
      name: "AMP Lecture",
      day: "Monday",
      startTime: "9:00 AM",
      endTime: "9:50 AM",
      location: "C-308",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "DBS Lab",
      name: "DBS Lab",
      day: "Monday",
      startTime: "2:00 PM",
      endTime: "3:50 PM",
      location: "CC Lab",
      color: "bg-red-100 text-red-800",
    },
    {
      id: "NPP Lec",
      name: "NPP Lecture",
      day: "Monday",
      startTime: "4:00 PM",
      endTime: "4:50 PM",
      location: "C-308",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "MuP Lec",
      name: "MuP Lecture",
      day: "Monday",
      startTime: "5:00 PM",
      endTime: "5:50 PM",
      location: "C-308",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "AMP Tut",
      name: "AMP Tutorial",
      day: "Tuesday",
      startTime: "8:00 AM",
      endTime: "8:50 AM",
      location: "C-308",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "SSP Lec",
      name: "SSP Lecture",
      day: "Tuesday",
      startTime: "10:00 AM",
      endTime: "10:50 AM",
      location: "C-308",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "DBS Lec",
      name: "DBS Lecture",
      day: "Tuesday",
      startTime: "11:00 AM",
      endTime: "11:50 AM",
      location: "LT-1",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "MuP Lec",
      name: "MuP Lecture",
      day: "Tuesday",
      startTime: "12:00 PM",
      endTime: "12:50 PM",
      location: "LT-1",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "DBS Lec",
      name: "DBS Lecture",
      day: "Wednesday",
      startTime: "8:00 AM",
      endTime: "8:50 AM",
      location: "LT-1",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "AMP Lec",
      name: "AMP Lecture",
      day: "Wednesday",
      startTime: "9:00 AM",
      endTime: "9:50 AM",
      location: "C-308",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "SSP Lec",
      name: "SSP Lecture",
      day: "Wednesday",
      startTime: "10:00 AM",
      endTime: "10:50 AM",
      location: "C-308",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "DBS Lec",
      name: "DBS Lecture",
      day: "Wednesday",
      startTime: "11:00 AM",
      endTime: "11:50 AM",
      location: "LT-1",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "MuP Lec",
      name: "MuP Lecture",
      day: "Wednesday",
      startTime: "12:00 PM",
      endTime: "12:50 PM",
      location: "LT-1",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "SSP Tut",
      name: "SSP Tutorial",
      day: "Thursday",
      startTime: "8:00 AM",
      endTime: "8:50 AM",
      location: "C-308",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "DSA Lec",
      name: "DSA Lecture",
      day: "Thursday",
      startTime: "5:00 PM",
      endTime: "5:50 PM",
      location: "LT-1",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "MuP Tut",
      name: "MuP Tutorial",
      day: "Friday",
      startTime: "8:00 AM",
      endTime: "8:50 AM",
      location: "Room 110",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "AMP Lec",
      name: "AMP Lecture",
      day: "Friday",
      startTime: "9:00 AM",
      endTime: "9:50 AM",
      location: "Room 101",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "MuP Lab",
      name: "MuP Lab",
      day: "Friday",
      startTime: "2:00 PM",
      endTime: "3:50 PM",
      location: "CC Lab",
      color: "bg-red-100 text-red-800",
    },
    {
      id: "NPP Lec",
      name: "NPP Lecture",
      day: "Friday",
      startTime: "4:00 PM",
      endTime: "4:50 PM",
      location: "C-308",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "DSA Lec",
      name: "DSA Lecture",
      day: "Friday",
      startTime: "5:00 PM",
      endTime: "5:50 PM",
      location: "LT-2",
      color: "bg-purple-100 text-purple-800",
    },
  ]

  const [viewMode, setViewMode] = useState("week") // "week" or "list"

  // Function to get the class events for a specific day and time slot
  const getClassForTimeSlot = (day, timeSlot) => {
    return classSchedule.filter((cls) => {
      const startTimeIndex = timeSlots.indexOf(cls.startTime)
      const endTimeIndex =
        timeSlots.indexOf(cls.endTime) === -1 ? timeSlots.indexOf(timeSlot) + 1 : timeSlots.indexOf(cls.endTime)

      return (
        cls.day === day && timeSlots.indexOf(timeSlot) >= startTimeIndex && timeSlots.indexOf(timeSlot) < endTimeIndex
      )
    })
  }

  const WeekView = () => (
    <div className="grid gap-4 overflow-x-auto">
      <div className="grid grid-cols-[100px_repeat(5,minmax(180px,1fr))]">
        <div className="bg-muted/50"></div>
        {days.map((day) => (
          <div key={day} className="bg-muted/50 p-2 text-center font-medium">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[100px_repeat(5,minmax(180px,1fr))] gap-[1px] rounded-lg border">
        {timeSlots.map((timeSlot) => (
          <>
            <div key={timeSlot} className="p-2 text-sm text-muted-foreground">
              {timeSlot}
            </div>
            {days.map((day) => {
              const classes = getClassForTimeSlot(day, timeSlot)
              return (
                <div key={`${day}-${timeSlot}`} className="min-h-[60px] border-t p-1">
                  {classes.map((cls, index) => {
                    // Only render the class card on the first time slot it appears
                    if (cls.startTime === timeSlot) {
                      const startIndex = timeSlots.indexOf(cls.startTime)
                      const endIndex =
                        timeSlots.indexOf(cls.endTime) === -1 ? startIndex + 1 : timeSlots.indexOf(cls.endTime)
                      const duration = endIndex - startIndex

                      return (
                        <div
                          key={index}
                          className={`flex flex-col rounded-md ${cls.color} p-2 text-xs`}
                          style={{
                            height: `${Math.max(duration * 60, 58)}px`,
                            marginTop: "-1px",
                          }}
                        >
                          <div className="font-medium">
                            {cls.name} ({cls.id})
                          </div>
                          <div>
                            {cls.startTime} - {cls.endTime}
                          </div>
                          <div>{cls.location}</div>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )

  const ListView = () => (
    <div className="grid gap-4">
      {days.map((day) => (
        <div key={day}>
          <h3 className="mb-2 text-lg font-medium">{day}</h3>
          <div className="rounded-lg border">
            {classSchedule
              .filter((cls) => cls.day === day)
              .sort((a, b) => timeSlots.indexOf(a.startTime) - timeSlots.indexOf(b.startTime))
              .map((cls, index) => (
                <div key={index} className="flex items-center justify-between border-b p-4 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{cls.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {cls.startTime} - {cls.endTime}
                        </span>
                        <span>•</span>
                        <span>{cls.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={cls.color}>{cls.id}</Badge>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-sm text-muted-foreground">View your class schedule for the semester</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Button variant="outline" size="icon" className="rounded-r-none">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="rounded-none border-x-0">
              Current Week
            </Button>
            <Button variant="outline" size="icon" className="rounded-l-none">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button className="gap-2" variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center pb-2">
          <div className="flex-1">
            <CardTitle>Academic Year 2024-2025</CardTitle>
            <CardDescription>Spring Semester</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === "week" ? "default" : "outline"} size="sm" onClick={() => setViewMode("week")}>
              Week View
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              List View
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">{viewMode === "week" ? <WeekView /> : <ListView />}</CardContent>
      </Card>
    </div>
  )
}

