"use client"
import { AddMemberDialog } from "@/components/divisions/add-member-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Button from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Input from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDivisionsStore } from "@/stores/DivisionStore"
import { ChevronRight, Download, Filter, Home, Pencil, Plus, Search, Trash2, User } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function GroupMembersPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const divisionName = decodeURIComponent(params.division as string)
  const groupName = decodeURIComponent(params.group as string)
  
  const searchQuery = searchParams.get("search") || ""
  const page = Number.parseInt(searchParams.get("page") || "1")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    members,
    totalMembers,
    isLoading,
    fetchGroupMembers,
    showAddMemberDialog,
    setShowAddMemberDialog,
  } = useDivisionsStore()

  useEffect(() => {
    const loadGroupMembers = async () => {
      try {
        await fetchGroupMembers(
          divisionName,
          groupName, 
          {
            search: searchQuery,
            page,
            limit: 10,
            status: statusFilter
          }
        )
      } catch (error) {
        setError("Failed to load group members. Please try again later.")
        console.error(error)
      }
    }

    if (divisionName && groupName) {
      loadGroupMembers()
    }
  }, [divisionName, groupName, searchQuery, page, statusFilter])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    const params = new URLSearchParams()
    if (query) params.set("search", query)
    if (page > 1) params.set("page", page.toString())
    if (statusFilter) params.set("status", statusFilter)
    
    router.push(`/main/divisions/${encodeURIComponent(divisionName)}/${encodeURIComponent(groupName)}?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`/main/divisions/${encodeURIComponent(divisionName)}/${encodeURIComponent(groupName)}?${params.toString()}`)
  }

  const handleFilterChange = (status: string | null) => {
    setStatusFilter(status)
    const params = new URLSearchParams(searchParams)
    status ? params.set("status", status) : params.delete("status")
    params.set("page", "1")
    router.push(`/main/divisions/${encodeURIComponent(divisionName)}/${encodeURIComponent(groupName)}?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const totalPages = Math.ceil(totalMembers / 10)

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center">
            <nav className="flex items-center space-x-2">
              <Link href="/main/divisions" className="text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link href="/main/divisions" className="text-muted-foreground hover:text-foreground">
                All Divisions
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link 
                href={`/main/divisions/${encodeURIComponent(divisionName)}`} 
                className="text-muted-foreground hover:text-foreground"
              >
                {divisionName}
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{groupName}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members"
              className="w-full pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Import
            </Button>
            <Button onClick={() => setShowAddMemberDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFilterChange(null)}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("inactive")}>Inactive</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("pending")}>Pending</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-md border">
            <Table>
              {/* Loading skeleton */}
            </Table>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No members found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery || statusFilter
                ? "Try different search terms or filters"
                : "Get started by adding members to this group"}
            </p>
            <Button onClick={() => setShowAddMemberDialog(true)} className="mt-4">
              Add Member
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <span>{member.email.split('@')[0]}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {members.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages} • {totalMembers} total members
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && handlePageChange(page - 1)}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = page > 3 ? page - 2 + i : i + 1
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={pageNum === page}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages && handlePageChange(page + 1)}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      <AddMemberDialog
        open={showAddMemberDialog}
        onOpenChange={setShowAddMemberDialog}
        divisionId={divisionName}
        groupId={groupName}
      />
    </div>
  )
}