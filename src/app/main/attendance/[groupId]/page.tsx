"use client"

import LoadingSpinner from "@/components/LoadingSpinner"
import { AttendanceManagementView } from "@/components/RoleBasedView"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Button from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Input from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getDivisionFromRole, isDivisionHead } from "@/lib/divisionPermissions"
import { useAttendanceStore } from "@/stores/attendanceStore"
import { useUserStore } from "@/stores/userStore"
import { AlertCircle, ChevronRight, Filter, Search } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Member {
  _id: string;
  firstName?: string;
  lastName?: string;
  group?: string;
  division?: string;
}

export default function GroupAttendancePage() {
  const router = useRouter()
  const params = useParams()
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId
  const { user } = useUserStore()

  const { currentSession, members, isLoading, error, fetchSessionMembers, clearError } = useAttendanceStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterGroup, setFilterGroup] = useState<string[]>([])

  // Fetch session data on mount
  useEffect(() => {
    if (groupId) {
      fetchSessionMembers(groupId as string)
    }
  }, [groupId, fetchSessionMembers])

  // Get unique groups
  const groups = Array.from(new Set(members.map((m) => m.group)))

  // Filter members based on search query and group filter
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName || ""} ${member.lastName || ""}`.trim().toLowerCase()
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      (member.group && member.group.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesGroup = filterGroup.length === 0 || filterGroup.includes(member.group)

    return matchesSearch && matchesGroup
  })

  // Group members by their group
  const membersByGroup = groups.reduce(
    (acc, group) => {
      acc[group] = filteredMembers.filter((m) => m.group === group)
      return acc
    },
    {} as Record<string, Member[]>
  )

  const handleMemberClick = (memberId: string) => {
    router.push(`/main/members/${memberId}`)
  }

  // Handle group filter change
  const handleGroupFilterChange = (group: string) => {
    setFilterGroup((prev) => (prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]))
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
    );
  }

  return (
    <AttendanceManagementView targetDivision={getDivisionFromRole(user.member.clubRole) || 'all'}>
      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
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
              {/* <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4" />
                    Filter by Group
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Groups</h4>
                      <div className="space-y-2">
                        {groups.map((group) => (
                          <div key={group} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-${group.toLowerCase().replace(/\s+/g, "-")}`}
                              checked={filterGroup.includes(group)}
                              onCheckedChange={() => handleGroupFilterChange(group)}
                            />
                            <Label htmlFor={`filter-${group.toLowerCase().replace(/\s+/g, "-")}`}>{group}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => setFilterGroup([])}>
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover> */}
            </div>

            {Object.keys(membersByGroup).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No groups or members found. Try adjusting your search or filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(membersByGroup).map(([group, groupMembers]) => (
                  <div key={group}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">{group}</h2>
                        <p className="text-sm text-muted-foreground">{groupMembers.length} Members</p>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-blue-700"
                        onClick={() => router.push(`/main/attendance/${groupId}/members`)}
                      >
                        Attendance
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {groupMembers.length > 0 ? (
                        groupMembers.map((member) => (
                          <div
                            key={member._id}
                            className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/50"
                            onClick={() => handleMemberClick(member._id)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={`https://robohash.org/${member._id}?set=set3&size=100x100`}
                                  alt={member.firstName || "Member"}
                                  identifier={member._id}
                                />
                                <AvatarFallback>{member.firstName ? member.firstName.charAt(0) : "M"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {member.firstName && member.lastName
                                    ? `${member.firstName} ${member.lastName}`
                                    : "Unknown Member"}
                                </p>
                                <p className="text-xs text-muted-foreground">{member.division}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No members found in this group.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AttendanceManagementView>
  )
}
