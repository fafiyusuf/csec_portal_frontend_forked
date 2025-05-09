"use client";

import Button from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStore } from "@/stores/adminStore";
import { useDivisionsStore } from "@/stores/DivisionStore";
import useMembersStore from "@/stores/membersStore";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const AddHeadModal = ({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (head: { division: string; name: string; email: string }) => Promise<void>;
}) => {
  const { members, fetchMembers, loading: membersLoading, error: membersError } = useMembersStore();
  const { divisions, fetchDivisions, loading: divisionsLoading, error: divisionsError } = useDivisionsStore();
  const { fetchHeads } = useAdminStore();
  const [division, setDivision] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      fetchMembers({ limit: 200 }).catch(console.error);
      fetchDivisions().catch(console.error);
    }
  }, [open, fetchMembers, fetchDivisions]);

  const filteredMembers = useMemo(() => {
    const activeMembers = members.filter(member => member.membershipStatus === "Active");
    
    if (!searchTerm.trim()) return activeMembers;

    const term = searchTerm.toLowerCase();
    return activeMembers.filter(member => {
      const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
      const email = member.email?.toLowerCase() || '';
      const clubRole = member.clubRole?.toLowerCase() || '';

      return (
        fullName.includes(term) ||
        email.includes(term) ||
        clubRole.includes(term)
      );
    });
  }, [members, searchTerm]);

  const handleSubmit = async () => {
    if (!division || !name || !email) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await onSave({ division, name, email });
      toast.success("Head added successfully");
      
      // Refresh the heads list after successful addition
      try {
        await fetchHeads();
        toast.success("Heads list updated");
      } catch (fetchError) {
        console.error("Failed to refresh heads list:", fetchError);
        toast.warning("Head added but failed to refresh list");
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to add head");
      console.error("Add head error:", error);
      
      // Attempt to refresh heads list even if add failed (in case partial success)
      try {
        await fetchHeads();
      } catch (fetchError) {
        console.error("Failed to refresh heads list:", fetchError);
      }
    }
  };

  const resetForm = () => {
    setDivision("");
    setName("");
    setEmail("");
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Head</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Division Selection */}
          <div>
            <Label>Division</Label>
            <Select
              value={division}
              onValueChange={setDivision}
              disabled={divisionsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={divisionsLoading ? "Loading divisions..." : "Select division"} />
              </SelectTrigger>
              <SelectContent>
                {divisionsLoading ? (
                  <div className="py-6 text-center text-sm">Loading divisions...</div>
                ) : divisionsError ? (
                  <div className="py-6 text-center text-sm text-red-500">{divisionsError}</div>
                ) : divisions.length === 0 ? (
                  <div className="py-6 text-center text-sm">No divisions available</div>
                ) : (
                  divisions.map((div) => (
                    <SelectItem key={div.slug} value={div.name}>
                      {div.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Member Search and Selection */}
          <div className="space-y-2">
            <Label>Member</Label>
            
            {membersLoading ? (
              <div className="text-sm text-muted-foreground">Loading members...</div>
            ) : membersError ? (
              <div className="text-sm text-red-500">{membersError}</div>
            ) : (
              <Select
                value={email}
                onValueChange={(value) => {
                  const member = members.find(m => m.email === value);
                  if (member) {
                    setEmail(member.email);
                    setName(`${member.firstName} ${member.lastName}`);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={members.length === 0 ? "No members available" : "Select a member"}>
                    {email ? `${name} (${email})` : ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <div className="py-6 text-center text-sm">
                      {searchTerm ? "No matching active members found" : "No active members available"}
                    </div>
                  ) : (
                    filteredMembers.map((member) => (
                      <SelectItem key={member._id} value={member.email}>
                        <div className="flex flex-col">
                          <span>{member.firstName} {member.lastName}</span>
                          <span className="text-xs text-muted-foreground">{member.email}</span>
                          {member.clubRole && (
                            <span className="text-xs text-muted-foreground">{member.clubRole}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={membersLoading || divisionsLoading || !division || !email}
            >
              {membersLoading || divisionsLoading ? "Adding..." : "Add Head"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};