"use client"

import SessionCard from "@/components/attendance/session-card"
import Button from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Input from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAttendanceStore } from "@/stores/attendanceStore"
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react"
import { useEffect, useState } from "react"

export default function AttendancePage() {
  const { sessions, divisions } = useAttendanceStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState("4")
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [filterDivisions, setFilterDivisions] = useState<string[]>([])

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus, filterDivisions])

  // Filter sessions based on search query and filters
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.division.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(session.status)

    const matchesDivision = filterDivisions.length === 0 || filterDivisions.includes(session.division)

    return matchesSearch && matchesStatus && matchesDivision
  })

  // Pagination
  const totalSessions = filteredSessions.length
  const totalPages = Math.ceil(totalSessions / Number(itemsPerPage))
  const startIndex = (currentPage - 1) * Number(itemsPerPage)
  const endIndex = Math.min(startIndex + Number(itemsPerPage), totalSessions)
  const currentSessions = filteredSessions.slice(startIndex, endIndex)

  // Handle filter status change
  const handleStatusChange = (status: string) => {
    setFilterStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  // Handle filter division change
  const handleDivisionChange = (division: string) => {
    setFilterDivisions((prev) => (prev.includes(division) ? prev.filter((d) => d !== division) : [...prev, division]))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>All Attendance</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
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
                      checked={filterStatus.includes("ended")}
                      onCheckedChange={() => handleStatusChange("ended")}
                    />
                    <Label htmlFor="filter-ended">Ended</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-planned"
                      checked={filterStatus.includes("planned")}
                      onCheckedChange={() => handleStatusChange("planned")}
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
        </Popover>
      </div>

      <div className="space-y-4">
        {currentSessions.length > 0 ? (
          currentSessions.map((session) => <SessionCard key={session.id} session={session} />)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No sessions found. Try adjusting your search or filters.
          </div>
        )}
      </div>

      {totalSessions > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Showing</span>
            <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
              <SelectTrigger className="w-16" onClick={() => {}}>
                <SelectValue>{itemsPerPage}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {endIndex} out of {totalSessions} records
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
    </div>
  )
}
