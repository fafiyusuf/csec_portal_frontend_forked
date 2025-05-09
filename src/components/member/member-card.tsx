"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Button from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/cards"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Member } from "@/types/member"
import { Edit, MoreVertical, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

interface MemberCardProps {
  member: Member
  onEdit: (member: Member) => void
  onDelete: (member: Member) => void
  canEdit: boolean
  canDelete: boolean
}

export function MemberCard({ member, onEdit, onDelete, canEdit, canDelete }: MemberCardProps) {
  const router = useRouter()

  const handleProfileClick = (memberId: string) => {
    router.push(`/main/profile/${memberId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/10 text-green-500 dark:bg-green-500/20"
      case "inactive":
        return "bg-red-500/10 text-red-500 dark:bg-red-500/20"
      case "probation":
        return "bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 dark:bg-gray-500/20"
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return '';
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="bg-primary/10 h-12"></div>
      </CardHeader>
      <CardContent className="pt-0 -mt-6">
        <div className="flex flex-col items-center">
          <Avatar 
            className="h-16 w-16 border-4 border-background cursor-pointer"
            onClick={() => handleProfileClick(member._id)}
          >
            <AvatarImage 
              src={member.profilePicture ? 
                (String(member.profilePicture).startsWith('https://res.cloudinary.com') ? 
                  String(member.profilePicture) : 
                  `https://res.cloudinary.com/dqgzhdegr/image/upload/${String(member.profilePicture)}`)
                : `https://robohash.org/${member._id}?set=set4`} 
              alt={`${member.firstName} ${member.lastName}`} 
            />
            <AvatarFallback>{getInitials(`${member.firstName} ${member.lastName}`)}</AvatarFallback>
          </Avatar>
          <h3 
            className="mt-2 font-semibold text-lg cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => handleProfileClick(member._id)}
          >
            {`${member.firstName} ${member.lastName}`}
          </h3>
          <p className="text-sm text-muted-foreground">{member.clubRole}</p>

          <div className="grid grid-cols-2 gap-2 w-full mt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Division:</p>
              <p>{member.division}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Group:</p>
              <p>{member.group || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Year:</p>
              <p>{member.graduationYear || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Attendance:</p>
              <p>{member.Attendance || 'N/A'}</p>
            </div>
          </div>

          <Badge className={`mt-4 ${getStatusColor(member.membershipStatus || 'Unknown')}`}>
            {member.membershipStatus || 'Unknown'}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {(canEdit || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(member)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => onDelete(member)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button variant="outline" size="sm" className="ml-auto">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  )
}
