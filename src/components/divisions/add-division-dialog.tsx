"use client"

import Button from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Input from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useDivisionsStore } from "@/stores/DivisionStore"
import { useState } from "react"
import { useUserStore } from "@/stores/userStore"
import { canAddDivision } from "@/lib/divisionPermissions"

interface AddDivisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddDivisionDialog({ open, onOpenChange }: AddDivisionDialogProps) {
  const [divisionName, setDivisionName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addDivision } = useDivisionsStore()
  const { user } = useUserStore();

  // Only allow if user is President or Vice President
  if (!canAddDivision(user?.member?.clubRole)) {
    return null;
  }

  const validateDivisionName = (name: string): boolean => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Division name cannot be empty."
      })
      return false;
    }
    if (name.length < 3) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Division name must be at least 3 characters long."
      })
      return false;
    }
    if (name.length > 50) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Division name cannot exceed 50 characters."
      })
      return false;
    }
    return true;
  }

  const handleSubmit = async () => {
    if (!validateDivisionName(divisionName)) {
      return;
    }

    setIsSubmitting(true)
    try {
      const success = await addDivision({ divisionName });
      if (success) {
        toast({
          variant: "default",
          className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
          title: "Success!",
          description: "Division created successfully. A new division head can now be assigned."
        })
        setDivisionName("")
        onOpenChange(false)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create division. Please try again."
        })
      }
    } catch (error) {
      console.error("Failed to add division:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create division"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Division</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="division-name">Division Name</Label>
            <Input
              id="division-name"
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              placeholder="Enter division name"
              maxLength={50}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter a name for the new division. This will create a new division that can be managed by a division head.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!divisionName.trim() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isSubmitting ? 'Creating...' : 'Create Division'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}