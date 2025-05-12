"use client"

import { AttendanceManagementView } from "@/components/RoleBasedView"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Button from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Input from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getDivisionFromRole, isDivisionHead } from "@/lib/divisionPermissions"
import { cn } from "@/lib/utils"
import { useAttendanceStore } from "@/stores/attendanceStore"
import { useUserStore } from "@/stores/userStore"
import { UserRole } from "@/types/member"
import { AlertCircle, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"

export default function MembersAttendancePage() {
  const router = useRouter()
  const { groupId } = useParams()
  const { user } = useUserStore()
  const {
    currentSession,
    members,
    isLoading,
    error,
    fetchSessionMembers,
    updateMemberAttendance,
    updateMemberExcused,
    addHeadsUpNote,
    saveAttendance,
    clearError,
    fetchSessionAttendance,
    setAttendanceTakenSessions,
  } = useAttendanceStore()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [headsUpOpen, setHeadsUpOpen] = useState(false)
  const [headsUpNote, setHeadsUpNote] = useState("")
  const [filterAttendance, setFilterAttendance] = useState<string[]>([])
  const [filterExcused, setFilterExcused] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Fetch session data on mount
  useEffect(() => {
    if (groupId) {
      fetchSessionMembers(groupId as string)
      // If session is ended, fetch the attendance records
      if (currentSession?.status.toLowerCase() === 'ended') {
        fetchSessionAttendance(groupId as string)
      }
    }
  }, [groupId, fetchSessionMembers, currentSession?.status])

  // Filter members based on search query and filters
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName || ""} ${member.lastName || ""}`.trim().toLowerCase()
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      (member.group && member.group.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesAttendance =
      filterAttendance.length === 0 || (member.attendance && filterAttendance.includes(member.attendance))

    const matchesExcused =
      filterExcused.length === 0 ||
      (filterExcused.includes("excused") && member.excused) ||
      (filterExcused.includes("not-excused") && !member.excused)

    return matchesSearch && matchesAttendance && matchesExcused
  })

  // Pagination
  const totalMembers = filteredMembers.length
  const totalPages = Math.ceil(totalMembers / Number(itemsPerPage))
  const startIndex = (currentPage - 1) * Number(itemsPerPage)
  const endIndex = Math.min(startIndex + Number(itemsPerPage), totalMembers)
  const currentMembers = filteredMembers.slice(startIndex, endIndex)

  // Helper: check if attendance can be taken
  const isStarted = currentSession && ["ongoing", "on-going"].includes(currentSession.status.toLowerCase());
  const isAttendanceTaken = useAttendanceStore.getState().attendanceTakenSessions.includes(currentSession?._id || "")
  const canTakeAttendance = isStarted && !isAttendanceTaken

  const handleAttendanceChange = (memberId: string, status: "Present" | "Absent") => {
    updateMemberAttendance(memberId, status)
  }

  const handleExcusedChange = (memberId: string, excused: boolean) => {
    updateMemberExcused(memberId, excused)
  }

  const handleHeadsUp = (memberId: string) => {
    setSelectedMember(memberId)
    setHeadsUpNote("")
    setHeadsUpOpen(true)
  }

  const handleHeadsUpSubmit = () => {
    if (selectedMember && headsUpNote) {
      addHeadsUpNote(selectedMember, headsUpNote)
      setHeadsUpOpen(false)
      setHeadsUpNote("")
    }
  }

  const handleSave = async () => {
    if (!currentSession?._id) return
    
    if (!canTakeAttendance) {
      toast({
        title: "Attendance Not Allowed",
        description: isAttendanceTaken
          ? "Attendance has already been taken for this session."
          : currentSession.status.toLowerCase() === 'planned'
          ? "Cannot take attendance for planned sessions."
          : "This session has ended. You can only view the attendance.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      const sessionTime = currentSession.sessions?.[0] || {};
      const payload = {
        sessionId: currentSession._id,
        records: members.map(member => ({
          memberId: member._id,
          status: member.attendance || "Absent",
          ...(member.excused && { status: "Excused" }),
          headsUp: member.headsUpNote ? member.headsUpNote : '',
          sessionTitle: currentSession.sessionTitle || "N/A",
          day: sessionTime.day || '',
          startTime: sessionTime.startTime || '',
          endTime: sessionTime.endTime || ''
        }))
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/attendance`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data) {
        toast({
          title: "Attendance Saved",
          description: "Attendance has been saved successfully!",
        })
        // Update local state to reflect attendance taken
        setAttendanceTakenSessions(prev => [...prev, currentSession._id])
        // Refresh the session data to get updated attendance
        fetchSessionMembers(currentSession._id)
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save attendance.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle attendance filter change
  const handleAttendanceFilterChange = (status: string) => {
    setFilterAttendance((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  // Handle excused filter change
  const handleExcusedFilterChange = (status: string) => {
    setFilterExcused((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleProfileClick = (memberId: string) => {
    router.push(`/main/members/${memberId}`);
  };

  if (!user?.member?.clubRole || (user.member.clubRole !== 'President' && user.member.clubRole !== 'Vice President' && !isDivisionHead(user.member.clubRole as UserRole))) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. Only division heads and administrators can access attendance records.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AttendanceManagementView targetDivision={getDivisionFromRole(user.member.clubRole as UserRole) || 'all'}>
      <div className="p-4 md:p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button variant="outline" size="sm" onClick={clearError} className="mt-2">
              Dismiss
            </Button>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>All Attendance</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span>Attendance</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span>{currentSession?.sessionTitle || "Session"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or group"
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={handleSave}
              className="bg-blue-700 hover:bg-blue-800 text-white w-full md:w-auto"
              disabled={isSaving || isLoading || !canTakeAttendance}
            >
              {isSaving ? "Saving..." : isAttendanceTaken ? "Attendance Taken" : "Save"}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full md:w-auto">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Attendance Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-present"
                          checked={filterAttendance.includes("present")}
                          onCheckedChange={() => handleAttendanceFilterChange("present")}
                        />
                        <Label htmlFor="filter-present">Present</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-absent"
                          checked={filterAttendance.includes("absent")}
                          onCheckedChange={() => handleAttendanceFilterChange("absent")}
                        />
                        <Label htmlFor="filter-absent">Absent</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Excused Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-excused"
                          checked={filterExcused.includes("excused")}
                          onCheckedChange={() => handleExcusedFilterChange("excused")}
                        />
                        <Label htmlFor="filter-excused">Excused</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-not-excused"
                          checked={filterExcused.includes("not-excused")}
                          onCheckedChange={() => handleExcusedFilterChange("not-excused")}
                        />
                        <Label htmlFor="filter-not-excused">Not Excused</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterAttendance([])
                        setFilterExcused([])
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-4 font-medium">Member Name</th>
                    <th className="text-center p-4 font-medium">Group</th>
                    <th className="text-center p-4 font-medium">Attendance</th>
                    <th className="text-center p-4 font-medium">Excused</th>
                    <th className="text-right p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.length > 0 ? (
                    currentMembers.map((member) => (
                      <tr key={member._id} className="border-t">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar 
                              className="cursor-pointer"
                              onClick={() => handleProfileClick(member._id)}
                            >
                              <AvatarImage
                                src={`https://robohash.org/${member._id}?set=set3&size=100x100`}
                                alt={member.firstName || "Member"}
                                identifier={member._id}
                              />
                              <AvatarFallback>{member.firstName ? member.firstName.charAt(0) : "M"}</AvatarFallback>
                            </Avatar>
                            <div 
                              className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                              onClick={() => handleProfileClick(member._id)}
                            >
                              <p className="font-medium">
                                {member.firstName && member.lastName
                                  ? `${member.firstName} ${member.lastName}`
                                  : "Unknown Member"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-sm">{member.group}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Badge
                              className={cn(
                                "cursor-pointer px-4 py-1 rounded-full",
                                member.attendance === "Present"
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : "bg-muted hover:bg-muted/80",
                              )}
                              onClick={() => handleAttendanceChange(member._id, "Present")}
                            >
                              Present
                            </Badge>
                            <Badge
                              className={cn(
                                "cursor-pointer px-4 py-1 rounded-full",
                                member.attendance === "Absent"
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-muted hover:bg-muted/80",
                              )}
                              onClick={() => handleAttendanceChange(member._id, "Absent")}
                            >
                              Absent
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <Badge
                              className={cn(
                                "cursor-pointer px-4 py-1 rounded-full",
                                member.excused
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : "bg-muted hover:bg-muted/80",
                              )}
                              onClick={() => handleExcusedChange(member._id, !member.excused)}
                            >
                              {member.excused ? "Excused" : "Not Excused"}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            className="bg-blue-700 hover:bg-blue-800 text-white"
                            onClick={() => handleHeadsUp(member._id)}
                          >
                            Heads Up
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No members found. Try adjusting your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalMembers > 0 && (
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Showing</span>
              <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {endIndex} out of {totalMembers} records
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
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Heads Up Dialog */}
        <Dialog open={headsUpOpen} onOpenChange={setHeadsUpOpen}>
          <DialogContent className="sm:max-w-md bg-white p-6">
            <DialogHeader>
              <DialogTitle>Heads Up Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter a reason for absence"
                  rows={4}
                  value={headsUpNote}
                  onChange={(e) => setHeadsUpNote(e.target.value)}
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setHeadsUpOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-700 hover:bg-blue-800 text-white"
                  onClick={handleHeadsUpSubmit}
                  disabled={!headsUpNote.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AttendanceManagementView>
  )
}