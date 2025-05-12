"use client"

import Button from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Input from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useDivisionsStore } from "@/stores/DivisionStore"
import { useState } from "react"
import { useUserStore } from "@/stores/userStore"
import { canManageGroups } from "@/lib/divisionPermissions"

interface AddGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  divisionName: string
}

export function AddGroupDialog({ open, onOpenChange, divisionName }: AddGroupDialogProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addGroup } = useDivisionsStore()
  const { user } = useUserStore();

  // Only allow if user can manage groups in this division
  if (!canManageGroups(user?.member?.clubRole, divisionName)) {
    return null;
  }

  const validateGroupName = (name: string): boolean => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Group name cannot be empty."
      })
      return false;
    }
    if (name.length < 2) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Group name must be at least 2 characters long."
      })
      return false;
    }
    if (name.length > 30) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Group name cannot exceed 30 characters."
      })
      return false;
    }
    return true;
  }

  const handleSubmit = async () => {
    if (!validateGroupName(name)) {
      return;
    }

    setIsSubmitting(true)
    try {
      await addGroup(divisionName, name)
      toast({
        variant: "default",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
        title: "Success!",
        description: "Group created successfully. You can now add members to this group."
      })
      setName("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add group:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input 
              id="group-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter group name"
              maxLength={30}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter a name for the new group in {divisionName}. This group will be used to organize members.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}