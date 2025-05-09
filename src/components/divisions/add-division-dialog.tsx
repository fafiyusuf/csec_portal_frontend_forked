"use client"

import Button from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Input from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useDivisionsStore } from "@/stores/DivisionStore"
import { useState } from "react"

interface AddDivisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddDivisionDialog({ open, onOpenChange }: AddDivisionDialogProps) {
  const [divisionName, setDivisionName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addDivision } = useDivisionsStore()

  const handleSubmit = async () => {
    if (!divisionName) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a division name."
      })
      return
    }

    setIsSubmitting(true)
    try {
      const success = await addDivision({ divisionName });
      if (success) {
        toast({
          variant: "default",
          className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
          title: "Success!",
          description: "Division created successfully."
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
              placeholder="Division Name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!divisionName || isSubmitting}>
            Add Division
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}