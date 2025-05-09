"use client";

import { AddHeadModal } from "@/components/admin/AddHeadModal";
import { HeadsTable } from "@/components/admin/HeadsTable";
import Button from "@/components/ui/button";
import { useAdminStore } from "@/stores/adminStore";
import useMembersStore from "@/stores/membersStore";
import type { Head } from "@/types/admin";
import { useState } from "react";
import { toast } from "sonner";

export const HeadsTab = ({
  heads,
  onBanHead,
}: {
  heads: Head[];
  onUpdateHead: (id: string, head: Head) => Promise<void>;
  onBanHead: (id: string) => void;
}) => {
  const [isAddHeadModalOpen, setIsAddHeadModalOpen] = useState(false);
  const { addHead } = useAdminStore();
  const { members } = useMembersStore();

  const handleAddHead = async (headData: {
    division: string;
    name: string;
    email: string;
  }) => {
    try {
      await addHead({
        division: headData.division,
        name: headData.name,
        email: headData.email,
        role: 'Head',
        avatar: `https://robohash.org/${headData.email}?set=set1`,
        membershipStatus: 'active'
      });
      toast.success("Head added successfully");
      setIsAddHeadModalOpen(false);
    } catch (error) {
      toast.error("Failed to add head");
      console.error("Add head error:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddHeadModalOpen(true)}>
          Add Head
        </Button>
      </div>

      <HeadsTable 
        heads={heads} 
        onEdit={(head) => {
          // Implement edit functionality if needed
          console.log("Editing head:", head);
        }} 
        onBan={onBanHead}
      />

      <AddHeadModal
        open={isAddHeadModalOpen}
        onOpenChange={setIsAddHeadModalOpen}
        onSave={handleAddHead}
      />
    </div>
  );
};