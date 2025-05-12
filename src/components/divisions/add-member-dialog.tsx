"use client"

import Button from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Input from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useDivisionsStore } from "@/stores/DivisionStore"
import { useState } from "react"
import { useUserStore } from "@/stores/userStore"
import { canAddMembersToDivision } from "@/lib/divisionPermissions"

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  divisionId: string
  groupId: string
}

export function AddMemberDialog({ open, onOpenChange, divisionId, groupId }: AddMemberDialogProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { addMember, fetchGroupMembers } = useDivisionsStore()
  const { user } = useUserStore();

  // Only allow if user can add members to this division
  if (!canAddMembersToDivision(user?.member?.clubRole, divisionId)) {
    return null;
  }

  const handleSubmit = async () => {
    if (!email || !firstName || !lastName) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      })
      return
    }

    setIsSubmitting(true)
    try {
      await addMember(divisionId, groupId, {
        firstName,
        lastName,
        email,
        generatedPassword: password
      })
      
      // Refetch the group members to update the list
      await fetchGroupMembers(divisionId, groupId, {
        page: 1,
        limit: 10
      });

      toast({
        variant: "default",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
        title: "Success!",
        description: "Member added successfully."
      })
      setEmail("")
      setPassword("")
      setFirstName("")
      setLastName("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add member:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(password)
    setShowPassword(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
          </div>

          <div className="grid gap-2">
            <Label>Division</Label>
            <Input
              value={divisionId}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label>Group</Label>
            <Input
              value={groupId}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Enter Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Random Password</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleGeneratePassword}>
                Generate
              </Button>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Generated Password"
              readOnly
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!email || !password || !firstName || !lastName || isSubmitting}
          >
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}