"use client";

import { Pagination } from "@/components/admin/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import { useAdminStore } from "@/stores/adminStore";
import useMembersStore from "@/stores/membersStore";
import { Label } from "@radix-ui/react-label";
import { ArrowLeft, Ban, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const MembersTable = ({
  onBack,
}: {
  onBack?: () => void;
}) => {
  const { members, loading, error, fetchMembers } = useMembersStore();
  const { banMember } = useAdminStore();
  const router = useRouter();
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch members on mount
  useEffect(() => {
    fetchMembers().catch(err => {
      console.error("Failed to fetch members:", err);
    });
  }, [fetchMembers]);

  // Filter members based on search and status
  const filteredMembers = members.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      member.firstName?.toLowerCase().includes(searchLower) ||
      member.lastName?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.clubRole?.toLowerCase().includes(searchLower);

    const matchesStatus = 
      statusFilter === "all" || 
      member.membershipStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  // Selection handlers
  const toggleMemberSelection = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  const toggleAllMembers = (checked: boolean) => {
    if (checked) {
      const pageEmails = currentMembers
        .map(m => m.email)
        .filter((email): email is string => !!email);
      setSelectedEmails(prev => [...new Set([...prev, ...pageEmails])]);
    } else {
      const pageEmails = currentMembers
        .map(m => m.email)
        .filter((email): email is string => !!email);
      setSelectedEmails(prev => prev.filter(email => !pageEmails.includes(email)));
    }
  };

  // Ban members handler
  const handleBan = async () => {
    if (selectedEmails.length === 0) {
      toast.warning("Please select at least one member to ban");
      return;
    }
  
    try {
      await Promise.all(selectedEmails.map(email => banMember(email)));
      toast.success(`${selectedEmails.length} member(s) banned successfully`);
      setSelectedEmails([]);
      await fetchMembers();
    } catch (err) {
      toast.error("Failed to ban members");
      console.error("Ban error:", err);
    }
  };

  const handleProfileClick = (memberId: string) => {
    router.push(`/main/profile/${memberId}`);
  };

  if (loading) return <div className="p-4">Loading members...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-xl font-bold">Members Management</h2>
        </div>
        
        {selectedEmails.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleBan}
            className="gap-2"
          >
            <Ban className="h-4 w-4" />
            Ban Selected ({selectedEmails.length})
          </Button>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Search className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filter panel */}
      {isFilterOpen && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="font-medium mb-2">Filters</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Members table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left w-12">
                <Checkbox
                  checked={
                    currentMembers.length > 0 &&
                    currentMembers.every(m => 
                      m.email && selectedEmails.includes(m.email)
                    )
                  }
                  onCheckedChange={(checked) => 
                    toggleAllMembers(checked === true)
                  }
                />
              </th>
              <th className="p-4 text-left">Member</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentMembers.length > 0 ? (
              currentMembers.map((member) => (
                <tr
                  key={member._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4">
                    <Checkbox
                      checked={member.email ? selectedEmails.includes(member.email) : false}
                      onCheckedChange={() => 
                        member.email && toggleMemberSelection(member.email)
                      }
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="cursor-pointer" onClick={() => handleProfileClick(member._id)}>
                        <AvatarImage
                          src={member.profilePicture?.toString() || `https://robohash.org/${member._id}?set=set1`}
                          alt={`${member.firstName} ${member.lastName}`}
                        />
                        <AvatarFallback>
                          {(member.firstName?.[0] || '') + (member.lastName?.[0] || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => handleProfileClick(member._id)}
                      >
                        <div className="font-medium">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{member.clubRole || '-'}</td>
                  <td className="p-4">
                    <Badge 
                      variant={
                        member.membershipStatus === "Active" ? "default" :
                        member.membershipStatus === "Banned" ? "destructive" : "secondary"
                      }
                    >
                      {member.membershipStatus}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredMembers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
};