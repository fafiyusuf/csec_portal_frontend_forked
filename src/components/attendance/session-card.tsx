"use client"

import { Badge } from "@/components/ui/badge"
import Button from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Session } from "@/types/attendance"
import { format, parse } from "date-fns"
import { useEffect } from "react"
import { useUserStore } from "@/stores/userStore"
import { isPresident } from "@/utils/roles"
import { getDivisionFromRole } from "@/lib/divisionPermissions"

interface SessionCardProps {
  session: Session
  attendanceTaken: boolean
  onTakeAttendance: () => void
}

export default function SessionCard({ session, attendanceTaken, onTakeAttendance }: SessionCardProps) {
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

  const { user } = useUserStore();
  const userRole = user?.member?.clubRole;
  const userDivision = getDivisionFromRole(userRole);
  const canManageAttendance = isPresident(userRole) || (userDivision && userDivision === session.division);

  if ((session.status.toLowerCase() === "ongoing" || session.status.toLowerCase() === "on-going") && !attendanceTaken) {
    showButton = true;
    buttonLabel = "Take Attendance";
    buttonAction = onTakeAttendance;
  }

  // Only show button if canManageAttendance
  if (!canManageAttendance) {
    showButton = false;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 dark:shadow-xl dark:border dark:border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-400 dark:bg-green-900 dark:text-green-100`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold dark:text-gray-100">{session.sessionTitle}</h2>
            </div>
          </div>
          <p className="font-medium mt-2 text-gray-800 dark:text-gray-300">{session.division || ''}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{formatDate(session.startDate)}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{sessionTime}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <div className="flex gap-2">
          {showButton && (
            <Button 
              className="bg-blue-700 hover:bg-blue-800 text-white" 
              onClick={buttonAction}
              disabled={buttonDisabled}
            >
              {buttonLabel}
            </Button>
          )}
        </div>
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