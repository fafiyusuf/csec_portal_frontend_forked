"use client"

import { useToast } from "@/components/ui/use-toast"
import useMembersStore from "@/stores/membersStore"
import { UserRole } from "@/types/member"
import { useEffect, useRef, useState } from "react"
import { FiPlusCircle } from "react-icons/fi"
import { useUserStore } from "@/stores/userStore"
import { isPresident } from "@/utils/roles"
import { getDivisionFromRole } from "@/lib/divisionPermissions"

interface MemberFormProps {
  onSubmit?: (memberData: any) => Promise<void>;
  onClose?: () => void;
}

export function MemberForm({ onSubmit, onClose }: MemberFormProps) {
  const { addMember } = useMembersStore()
  const { toast } = useToast()
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [division, setDivision] = useState("")
  const [isDivisionOpen, setIsDivisionOpen] = useState(false)
  const [group, setGroup] = useState("")
  const [isGroupOpen, setIsGroupOpen] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const divisionRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)

  // ... (keep all your existing useEffect hooks for click outside and ESC key)

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let result = ""
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(result)
  }

  const validateForm = () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email is required"
      })
      return false
    }
    if (!firstName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "First name is required"
      })
      return false
    }
    if (!lastName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Last name is required"
      })
      return false
    }
    if (!division) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Division is required"
      })
      return false
    }
    if (!generatedPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please generate a password"
      })
      return false
    }
    return true
  }

  const handleInvite = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const memberData = {
        firstName,
        lastName,
        email,
        division,
        group,
        generatedPassword,
        clubRole: 'Member' as UserRole
      }

      if (onSubmit) {
        await onSubmit(memberData)
      } else {
        await addMember(memberData)
      }
      
      toast({
        title: "Success",
        description: "Member invited successfully! An email has been sent."
      })
      
      // Close modal and reset form
      setIsOpen(false)
      resetForm()
      if (onClose) {
        onClose()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite member"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setDivision("")
    setGroup("")
    setGeneratedPassword("")
  }

  const divisions = [
    { id: "Competitive Programming Division", name: "Competitive Programming" },
    { id: "Development Division", name: "Development" },
    { id: "Capacity Building Division", name: "Capacity Building" },
    { id: "Cybersecurity Division", name: "Cybersecurity" },
    { id: "Data Science Division", name: "Data Science" },
  ]

  const groups = [
    { id: "Group 1", name: "Group 1" },
    { id: "Group 2", name: "Group 2" },
    { id: "Group 3", name: "Group 3" },
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (divisionRef.current && !divisionRef.current.contains(event.target as Node)) {
        setIsDivisionOpen(false)
      }
      if (groupRef.current && !groupRef.current.contains(event.target as Node)) {
        setIsGroupOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen])
  
  // Only allow add member for President, Vice President, or division heads
  const userRole = user?.member?.clubRole;
  const userDivision = getDivisionFromRole(userRole);
  const canAdd = isPresident(userRole) || (userDivision && userDivision !== 'all');

  if (!canAdd) {
    // If this is a profile edit, allow only if editing own profile (not handled here)
    return null;
  }
  
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
      >
        <FiPlusCircle className="mr-2" />
        Add Member
      </button>
  
      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          {/* Modal Content */}
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="p-4 text-center border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-gray-100">Invite New Member</h2>
            </div>
  
            {/* Modal Body */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>
  
              {/* Name Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="robel"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="robel"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>
  
              {/* Division Dropdown */}
              <div ref={divisionRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Division *</label>
                <div
                  onClick={() => setIsDivisionOpen(!isDivisionOpen)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md flex justify-between items-center cursor-pointer bg-white dark:bg-gray-700 dark:text-gray-100"
                >
                  <span className={division ? "dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
                    {division || "Select Division"}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
  
                {isDivisionOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                    {divisions.map((div) => (
                      <div
                        key={div.id}
                        onClick={() => {
                          setDivision(div.id)
                          setIsDivisionOpen(false)
                        }}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer dark:text-gray-100"
                      >
                        {div.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
  
              {/* Group Dropdown */}
              <div ref={groupRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group</label>
                <div
                  onClick={() => setIsGroupOpen(!isGroupOpen)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md flex justify-between items-center cursor-pointer bg-white dark:bg-gray-700 dark:text-gray-100"
                >
                  <span className={group ? "dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
                    {group || "Select Group"}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
  
                {isGroupOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                    {groups.map((grp) => (
                      <div
                        key={grp.id}
                        onClick={() => {
                          setGroup(grp.id)
                          setIsGroupOpen(false)
                        }}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer dark:text-gray-100"
                      >
                        {grp.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
  
              {/* Password Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Click generate to create password"
                    value={generatedPassword}
                    readOnly
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={generateRandomPassword}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-md transition-colors whitespace-nowrap"
                    disabled={isSubmitting}
                  >
                    Generate
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This password will be sent to the member's email
                </p>
              </div>
            </div>
  
            {/* Modal Footer */}
            <div className="p-4 border-t dark:border-gray-700 flex justify-between">
              <button
                onClick={() => {
                  setIsOpen(false)
                  resetForm()
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-100"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={isSubmitting || !generatedPassword}
              >
                {isSubmitting ? 'Sending Invite...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )}