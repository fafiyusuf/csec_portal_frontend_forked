"use client"

import SessionCard from "@/components/attendance/session-card"
import LoadingSpinner from "@/components/LoadingSpinner"
import { AttendanceManagementView } from "@/components/RoleBasedView"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Button from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Input from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem } from "@/components/ui/select"
import { getDivisionFromRole, isDivisionHead } from "@/lib/divisionPermissions"
import { useAttendanceStore } from "@/stores/attendanceStore"
import { useUserStore } from "@/stores/userStore"
import { AlertCircle, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Session } from "@/types/attendance"
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE

export default function AttendancePage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [filterDivisions, setFilterDivisions] = useState<string[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(4)
  const [totalSessions, setTotalSessions] = useState(0)
  const [attendanceTakenSessions, setAttendanceTakenSessions] = useState<string[]>([])

  // Get unique divisions
  const divisions = [...new Set((sessions || []).map((session) => session.division))]

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_BASE_URL}/sessions`, {
          params: {
            page: currentPage,
            limit: itemsPerPage
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (response.data) {
          setSessions(response.data.sessions)
          setTotalSessions(response.data.totalSessions)
        }
      } catch (error) {
        console.error('Error fetching sessions:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch sessions')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSessions()
  }, [currentPage, itemsPerPage])

  // Function to check if attendance is taken for a session
  const checkAttendanceStatus = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/attendance/status/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data.attendanceTaken
    } catch (error) {
      console.error('Error checking attendance status:', error)
      return false
    }
  }

  // Update attendance status for all sessions
  useEffect(() => {
    const updateAttendanceStatus = async () => {
      const takenSessions: string[] = []
      for (const session of sessions) {
        const isTaken = await checkAttendanceStatus(session._id)
        if (isTaken) {
          takenSessions.push(session._id)
        }
      }
      setAttendanceTakenSessions(takenSessions)
    }
    if (sessions.length > 0) {
      updateAttendanceStatus()
    }
  }, [sessions])

  // Filter sessions based on search query and filters
  const filteredSessions = (sessions || []).filter((session) => {
    const matchesSearch =
      session.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.division.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(session.status)

    const matchesDivision = filterDivisions.length === 0 || filterDivisions.includes(session.division)

    return matchesSearch && matchesStatus && matchesDivision
  })

  // Only show ongoing sessions
  const ongoingSessions = (sessions || []).filter(session => session.status.toLowerCase() === 'ongoing')

  const currentSessions = sessions || []
  const totalPages = Math.ceil(totalSessions / Number(itemsPerPage))

  // Handle filter status change
  const handleStatusChange = (status: string) => {
    setFilterStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  // Handle filter division change
  const handleDivisionChange = (division: string) => {
    setFilterDivisions((prev) => (prev.includes(division) ? prev.filter((d) => d !== division) : [...prev, division]))
  }

  if (!user?.member?.clubRole || (user.member.clubRole !== 'President' && user.member.clubRole !== 'Vice President' && !isDivisionHead(user.member.clubRole))) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. Only division heads and administrators can access attendance records.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <AttendanceManagementView targetDivision={getDivisionFromRole(user.member.clubRole) || 'all'}>
      <div className="p-4 md:p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-2">
              Dismiss
            </Button>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Attendance</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>All Attendance</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {/* <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full md:w-auto">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-ended"
                          checked={filterStatus.includes("Ended")}
                          onCheckedChange={() => handleStatusChange("Ended")}
                        />
                        <Label htmlFor="filter-ended">Ended</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-planned"
                          checked={filterStatus.includes("Planned")}
                          onCheckedChange={() => handleStatusChange("Planned")}
                        />
                        <Label htmlFor="filter-planned">Planned</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Division</h4>
                    <div className="space-y-2">
                      {divisions.map((division) => (
                        <div key={division} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filter-${division.toLowerCase().replace(/\s+/g, "-")}`}
                            checked={filterDivisions.includes(division)}
                            onCheckedChange={() => handleDivisionChange(division)}
                          />
                          <Label htmlFor={`filter-${division.toLowerCase().replace(/\s+/g, "-")}`}>{division}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterStatus([])
                        setFilterDivisions([])
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover> */}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  attendanceTaken={attendanceTakenSessions.includes(session._id)}
                  onTakeAttendance={() => router.push(`/main/attendance/${session._id}`)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sessions found. Try adjusting your search or filters.
              </div>
            )}
          </div>
        )}

        {totalSessions > 0 && (
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Showing</span>
              <Select value={String(itemsPerPage)} onValueChange={(val) => {
                setItemsPerPage(Number(val))
                setCurrentPage(1)
              }}>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {currentPage * itemsPerPage - itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalSessions)} out of {totalSessions} records
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage * itemsPerPage >= totalSessions}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AttendanceManagementView>
  )
}
