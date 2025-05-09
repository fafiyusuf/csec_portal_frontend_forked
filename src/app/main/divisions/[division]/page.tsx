"use client"
import { AddGroupDialog } from "@/components/divisions/add-group-dialog"
import { GroupCard } from "@/components/divisions/group-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { canManageGroups } from "@/lib/divisionPermissions"
import { useDivisionsStore } from "@/stores/DivisionStore"
import { useUserStore } from "@/stores/userStore"
import { ChevronRight, Home, Search } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function DivisionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const divisionName = decodeURIComponent(params.division as string)
  const searchQuery = searchParams.get("search") || ""
  const [error, setError] = useState<string | null>(null)
  const { user } = useUserStore()

  const {
    currentDivision,
    loading,
    fetchDivisionGroups,
    fetchGroupMembers,
    members,
    showAddGroupDialog,
    setShowAddGroupDialog,
  } = useDivisionsStore()

  useEffect(() => {
    const loadDivisionDetails = async () => {
      try {
        await fetchDivisionGroups(divisionName)
        setError(null)
        console.log("Division details loaded successfully, currentDivision:", currentDivision)
      } catch (err) {
        setError("Failed to load division details")
      }
    }

    if (divisionName) loadDivisionDetails()
  }, [divisionName])

  // Fetch members for each group when groups are loaded
  useEffect(() => {
    const loadGroupMembers = async () => {
      if (currentDivision?.groups) {
        for (const group of currentDivision.groups) {
          try {
            await fetchGroupMembers(divisionName, group)
          } catch (err) {
            console.error(`Failed to fetch members for group ${group}:`, err)
          }
        }
      }
    }

    if (currentDivision?.groups) {
      loadGroupMembers()
    }
  }, [currentDivision?.groups, divisionName])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    const params = new URLSearchParams()
    if (query) params.set("search", query)
    router.push(`/main/divisions/${encodeURIComponent(divisionName)}?${params.toString()}`)
  }

  const filteredGroups = currentDivision?.groups?.filter((group) =>
    group.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const canManage = user?.member?.clubRole && canManageGroups(user.member.clubRole, divisionName);

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
            </nav>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6 space-y-6">
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
              placeholder="Search"
              className="w-full pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          {user?.member?.clubRole && (
            <Button 
              onClick={() => setShowAddGroupDialog(true)}
              disabled={!canManage}
            >
              Add Group
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-lg border animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No groups found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery ? "Try a different search term or" : "Get started by"} creating a new group.
            </p>
            <Button 
              onClick={() => setShowAddGroupDialog(true)}
              disabled={!canManage}
              className="mt-4"
            >
              Add Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGroups.map((groupName) => (
              <GroupCard
                key={groupName}
                groupName={groupName}
                divisionName={divisionName}
                memberCount={currentDivision?.groupMemberCounts?.[groupName] || 0}
                members={currentDivision?.groupMembers?.[groupName]?.map(member => ({
                  _id: member._id,
                  name: `${member.firstName} ${member.lastName}`,
                  email: member.email,
                  status: member.membershipStatus || 'unknown',
                  profilePicture: member.profilePicture?.toString()
                })) || []}
                onAddMember={() => {
                  setShowAddGroupDialog(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <AddGroupDialog
        open={showAddGroupDialog}
        onOpenChange={setShowAddGroupDialog}
        divisionName={divisionName}
      />
    </div>
  )
}