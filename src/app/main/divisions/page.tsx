"use client"
import { AddDivisionDialog } from "@/components/divisions/add-division-dialog"
import { DivisionCard } from "@/components/divisions/division-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { canManageDivision } from "@/lib/divisionPermissions"
import { useDivisionsStore } from "@/stores/DivisionStore"
import { useUserStore } from "@/stores/userStore"
import { ChevronRight, Home, Search } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function DivisionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const [error, setError] = useState<string | null>(null)
  const { user } = useUserStore()
  const userRole = user?.member?.clubRole?.toLowerCase();

  const { divisionSummaries, loading, fetchDivisionSummaries, showAddDivisionDialog, setShowAddDivisionDialog } = useDivisionsStore()

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        await fetchDivisionSummaries()
        setError(null)
      } catch (err) {
        setError("Failed to load division summaries. Please try again later.")
        console.error(err)
      }
    }

    loadSummaries()
  }, [fetchDivisionSummaries])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    if (query) {
      router.push(`/main/divisions?search=${encodeURIComponent(query)}`)
    } else {
      router.push("/main/divisions")
    }
  }

  // Filtered divisions: Only show all if President/Vice President, else only show the division head's division
  const isPresident = user?.member?.clubRole === 'President' || user?.member?.clubRole === 'Vice President';
  let filteredDivisions = divisionSummaries.filter(division =>
    division.division.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (!isPresident && user?.member?.clubRole?.includes('President')) {
    // Only show the division for which the user is head (exact match, robust to 'Division' suffix)
    const userDivision = user?.member?.clubRole
      ?.replace(/ division president$/i, ' Division')
      ?.trim();
    // Debug log
    console.log('userRole:', user?.member?.clubRole);
    console.log('userDivision:', userDivision);
    console.log('allDivisions:', divisionSummaries.map(d => d.division.toLowerCase()));
    filteredDivisions = filteredDivisions.filter(division =>
      division.division.toLowerCase() === userDivision?.toLowerCase()
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <nav className="flex items-center space-x-2">
            <Link href="/main/divisions" className="text-foreground font-medium">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">All Divisions</span>
          </nav>
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
          {isPresident && (
            <Button 
              onClick={() => setShowAddDivisionDialog(true)}
              disabled={!canManageDivision(user?.member?.clubRole, 'all')}
            >
              Add Division
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-lg border animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredDivisions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No divisions found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery ? "Try a different search term or" : "Get started by"} creating a new division.
            </p>
            {isPresident && (
              <Button onClick={() => setShowAddDivisionDialog(true)} className="mt-4">
                Add Division
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDivisions.map((summary) => (
              <DivisionCard
                key={summary.division}
                division={{
                  name: summary.division,
                  groups: summary.groups,
                  memberCount: summary.groups.reduce((acc: number, g: any) => acc + (g.memberCount || 0), 0)
                }}
                groupCount={summary.groupCount}
                memberCount={summary.groups.reduce((acc: number, g: any) => acc + (g.memberCount || 0), 0)}
              />
            ))}
          </div>
        )}
      </div>

      <AddDivisionDialog open={showAddDivisionDialog} onOpenChange={setShowAddDivisionDialog} />
    </div>
  )
}