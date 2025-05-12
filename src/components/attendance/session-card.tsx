"use client"

import { Badge } from "@/components/ui/badge"
import Button from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Session } from "@/types/attendance"
import { format, parse } from "date-fns"
import { useEffect } from "react"

interface SessionCardProps {
  session: Session
  attendanceTaken: boolean
  onTakeAttendance: () => void
  onViewAttendance: () => void
}

export default function SessionCard({ session, attendanceTaken, onTakeAttendance, onViewAttendance }: SessionCardProps) {
  // Helper function to format dates
  useEffect(() => {
  console.log("Fetched sessions:", session);
}, [session]);
  const formatDate = (dateString: string) => {
    try {
      const date = parse(dateString, "yy/MM/dd", new Date())
      return format(date, "MMM d, yyyy")
    } catch (e) {
      return dateString // fallback if parsing fails
    }
  }

  // Get the first session time if available
  const firstSessionTime = session.sessions?.[0]
  const sessionTime = firstSessionTime 
    ? `${firstSessionTime.day} ${firstSessionTime.startTime} - ${firstSessionTime.endTime}`
    : "Time not specified"

  let showButton = false;
  let buttonLabel = "";
  let buttonAction = () => {};
  let buttonDisabled = false;

  if (session.status.toLowerCase() === "ongoing") {
    showButton = true;
    if (attendanceTaken) {
      buttonLabel = "View Attendance";
      buttonAction = onViewAttendance;
    } else {
      buttonLabel = "Take Attendance";
      buttonAction = onTakeAttendance;
    }
  } else if (session.status.toLowerCase() === "ended") {
    showButton = true;
    buttonLabel = "View Attendance";
    buttonAction = onViewAttendance;
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow dark:bg-gray-800 dark:text-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={cn(
                "px-3 py-1 text-xs font-medium dark:bg-gray-800 dark:text-white",
                session.status.toLowerCase() === "ended" 
                  ? "bg-red-100 text-red-800" 
                  : session.status.toLowerCase() === "planned"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800",
              )}
            >
              {session.status}
            </Badge>
            <h3 className="font-semibold dark:bg-gray-800 dark:text-white">{session.division}</h3>
          </div>
          <h4 className="text-lg font-semibold mb-1 dark:bg-gray-800 dark:text-white">{session.sessionTitle}</h4>
          <p className="text-sm text-muted-foreground dark:bg-gray-800 dark:text-white">
            {formatDate(session.startDate)} - {formatDate(session.endDate)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{sessionTime}</p>
        </div>
        {showButton && (
          <Button
            className={buttonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800 text-white"}
            onClick={buttonAction}
            disabled={buttonDisabled}
          >
            {buttonLabel}
          </Button>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        {session.groups?.map((group) => (
          <Badge key={group} variant="default" className="rounded-full">
            {group}
          </Badge>
        ))}
      </div>
    </div>
  )
}