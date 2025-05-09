"use client"

import { MemberForm } from "@/components/member/member-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards";
import { Dialog } from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import useMembersStore from "@/stores/membersStore";
import { useUserStore } from "@/stores/userStore";
import type { Member } from "@/types/member";
import { ChevronLeft, ChevronRight, Filter, Search, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    division: "",
    group: "",
    campusStatus: "",
    attendance: "",
    membershipStatus: "",
    divisionRole: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const {
    members,
    loading,
    error,
    totalMembers,
    fetchMembers,
    addMember,
    deleteMember,
    canAddMember,
    canDeleteMember,
  } = useMembersStore();

  const totalPages = Math.ceil(totalMembers / itemsPerPage);

  const userStore = useUserStore();

  const router = useRouter();

  useEffect(() => {
    fetchMembers({
      search: searchQuery,
      ...filterOptions,
      page: currentPage,
      limit: itemsPerPage,
    });
  }, [fetchMembers, searchQuery, filterOptions, currentPage, itemsPerPage,debouncedSearchQuery,filterOptions.division,filterOptions.group,filterOptions.campusStatus,filterOptions.attendance,filterOptions.membershipStatus,filterOptions.divisionRole]);

  const getInitials = (name?: string | null) => {
    if (!name || typeof name !== 'string') return <User className="h-4 w-4" />;
    
    const parts = name.trim().split(' ');
    if (parts.length === 0) return <User className="h-4 w-4" />;
    
    return parts
      .filter(part => part.length > 0)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('') || <User className="h-4 w-4" />;
  };

  const getStatusColor = (status?: string | null) => {
    switch ((status || '').toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "probation": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
  
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: typeof filterOptions) => {
    setFilterOptions(newFilters);
  };

  const handleAddMember = async (memberData: Omit<Member, "_id" | "createdAt">) => {
    try {
      await addMember(memberData);
      // Refresh the members list
      await fetchMembers({
        search: searchQuery,
        ...filterOptions,
        page: currentPage,
        limit: itemsPerPage,
      });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Member added successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add member",
        variant: "destructive",
      });
    }
  };
  const handleProfileClick = (memberId: string) => {
    router.push(`/main/members/${memberId}`);
  };
  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      await deleteMember(selectedMember._id);
      // Refresh the members list
      await fetchMembers({
        search: searchQuery,
        ...filterOptions,
        page: currentPage,
        limit: itemsPerPage,
      });
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete member",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="container mx-auto p-4 space-y-4 dark:bg-gray-900">
    <Card className="dark:border dark:border-gray-800">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 dark:bg-gray-800">
        <CardTitle className="text-2xl font-bold dark:text-white">All Members</CardTitle>
        <div className="flex items-center space-x-2">
          {canAddMember() && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <MemberForm 
                  onSubmit={handleAddMember} 
                  onClose={() => setIsAddDialogOpen(false)}
                />
            </Dialog>
          )}
        </div>
      </CardHeader>
  
      <CardContent className="dark:bg-gray-900">
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
            <Input 
              placeholder="Search members..." 
              className="pl-8 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400" 
              value={searchQuery} 
              onChange={handleSearch} 
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>
  
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full mt-4">
            <select
              className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={filterOptions.division}
              onChange={(e) => handleFilterChange({ ...filterOptions, division: e.target.value })}
            >
              <option value="">All Divisions</option>
              <option value="Competitive Programming Division">Competitive Programming Division</option>
              <option value="Development Division">Development Division</option>
              <option value="Capacity Building Division">Capacity Building Division</option>
              <option value="Cybersecurity Division">Cybersecurity Division</option>
              <option value="Data Science Division">Data Science Division</option>
            </select>
  
            <select
              className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={filterOptions.membershipStatus}
              onChange={(e) => handleFilterChange({ ...filterOptions, membershipStatus: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
  
            <select
              className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={filterOptions.campusStatus}
              onChange={(e) => handleFilterChange({ ...filterOptions, campusStatus: e.target.value })}
            >
              <option value="">All Campus Statuses</option>
              <option value="on-campus">On Campus</option>
              <option value="off-campus">Off Campus</option>
            </select>
          </div>
        )}
  
        {/* Members Table */}
        <div className="rounded-md border overflow-hidden dark:border-gray-800">
          <Table>
            <TableHeader className="dark:bg-gray-800">
              <TableRow className="hover:bg-transparent dark:border-gray-800">
                <TableHead className="dark:text-gray-300">Member Name</TableHead>
                <TableHead className="hidden md:table-cell dark:text-gray-300">ID</TableHead>
                <TableHead className="hidden md:table-cell dark:text-gray-300">Division</TableHead>
                <TableHead className="hidden lg:table-cell dark:text-gray-300">Group</TableHead>
                <TableHead className="hidden lg:table-cell dark:text-gray-300">Attendance</TableHead>
                <TableHead className="hidden md:table-cell dark:text-gray-300">Year</TableHead>
                <TableHead className="dark:text-gray-300">Status</TableHead>
                <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
  
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="dark:border-gray-800">
                    <TableCell colSpan={7} className="h-16 text-center">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto dark:bg-gray-700"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow className="dark:border-gray-800">
                  <TableCell colSpan={7} className="h-24 text-center text-red-500 dark:text-red-400">
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : (members?.length ?? 0) === 0 ? (
                <TableRow className="dark:border-gray-800">
                  <TableCell colSpan={7} className="h-24 text-center dark:text-gray-400">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                members?.map((member) => (
                  <TableRow key={member._id} className="dark:border-gray-800 dark:hover:bg-gray-800">
                    <TableCell className="font-medium flex items-center gap-2 dark:text-white">
                      <Avatar className="cursor-pointer" onClick={() => handleProfileClick(member._id)}>
                        <AvatarImage 
                          src={member.profilePicture ? 
                            (String(member.profilePicture).startsWith('https://res.cloudinary.com') ? 
                              String(member.profilePicture) : 
                              `https://res.cloudinary.com/dqgzhdegr/image/upload/${String(member.profilePicture)}`)
                            : `https://robohash.org/${member._id}?set=set3`}
                          alt={member.firstName || 'Member'} 
                          className="cursor-pointer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://robohash.org/${member._id}?set=set3`;
                          }}
                        />
                        <AvatarFallback className="dark:bg-gray-700 dark:text-white">
                          {getInitials(member.firstName)}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => handleProfileClick(member._id)}
                      >
                        <div>{[member.firstName, member.lastName].filter(Boolean).join(' ') || 'Unnamed Member'}</div>
                        <div className="text-xs text-muted-foreground dark:text-gray-400">
                          {member.clubRole || 'No role specified'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell dark:text-gray-400">
                      {member.universityId || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell dark:text-gray-400">
                      {member.division || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell dark:text-gray-400">
                      {member.group || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell dark:text-gray-400">
                      {member.Attendance || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell dark:text-gray-400">
                      {member.graduationYear || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(member.membershipStatus)} dark:bg-opacity-30`}>
                        {member.membershipStatus || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="dark:hover:bg-gray-700"
                        onClick={() => {
                          setSelectedMember(member);
                          setIsDeleteDialogOpen(true);
                        }}
                        disabled={!canDeleteMember()}
                      >
                        <Trash2 className="h-4 w-4 dark:text-gray-300" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
  
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground dark:text-gray-400">
            Showing {currentPage * itemsPerPage - itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalMembers)} of {totalMembers} records
          </div>
  
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
  
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    let pageNumber = i + 1;
    if (totalPages > 5 && currentPage > 3) {
      pageNumber = currentPage - 2 + i;
      if (pageNumber > totalPages) return null;
    }
    
    return (
      <Button
        key={pageNumber}
        variant={currentPage === pageNumber ? "default" : "outline"}
        size="icon"
        onClick={() => handlePageChange(pageNumber)}
        disabled={pageNumber < 1 || pageNumber > totalPages}
      >
        {pageNumber}
      </Button>
    );
  })}

  {totalPages > 5 && (
    // <span className="px-2">...</span>
    <Button
      variant="outline"
      size="icon"
      onClick={() => handlePageChange(totalPages)}
    >
      {totalPages}
    </Button>
  )}

  
            <Button
              variant="outline"
              size="icon"
              className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  
    {/* Delete Dialog */}
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-400">
            This action cannot be undone. This will ban the member
            {selectedMember && ` ${selectedMember.firstName || 'this member'}`} from the club.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteMember} 
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>);
}