import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards";
import { useUserStore } from "@/stores/userStore";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GroupCardProps {
  groupName: string;
  divisionName: string;
  memberCount: number;
  members?: {
    _id: string;
    name: string;
    email: string;
    status: string;
    profilePicture?: string;
  }[];
  onAddMember?: () => void;
}

export function GroupCard({ 
  groupName, 
  divisionName, 
  memberCount, 
  members = [],
  onAddMember 
}: GroupCardProps) {
  const router = useRouter();
  const { user, hasRole, hasDivisionAccess } = useUserStore();
  const canAddMembers = user?.member?.clubRole === 'President' || 
                       user?.member?.clubRole === 'Vice President' ||
                       (user?.member?.clubRole?.includes('President') && hasDivisionAccess(divisionName as any));

  const encodedDivision = encodeURIComponent(divisionName);
  const encodedGroup = encodeURIComponent(groupName);

  const handleMemberClick = (memberId: string) => {
    router.push(`/main/members/${memberId}`);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate robohash URL for missing profile pictures
  const getRobohashUrl = (email: string) => {
    const hash = email.toLowerCase().trim();
    return `https://robohash.org/${hash}?set=set3&size=200x200`;
  };

  // Validate and format profile picture URL
  const getProfilePictureUrl = (url?: string) => {
    if (!url) return null;
    try {
      const validUrl = new URL(url);
      return validUrl.toString();
    } catch {
      return null;
    }
  };

  // Ensure members is always an array
  const safeMembers = Array.isArray(members) ? members : [];

  return (
    <Card className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-gray-900 dark:text-white">{groupName || "Unnamed Group"}</CardTitle>
          <div className="flex items-center gap-2">
            {canAddMembers && onAddMember && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddMember}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </Button>
            )}
            <Link
              href={`/main/divisions/${encodedDivision}/${encodedGroup}`}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1"
            >
              View Details
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {safeMembers.length > 0 ? (
            <>
              {safeMembers.slice(0, 5).map((member) => {
                const profilePictureUrl = getProfilePictureUrl(member.profilePicture);
                const robohashUrl = getRobohashUrl(member.email);
                
                return (
                  <div
                    key={member._id}
                    onClick={() => handleMemberClick(member._id)}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {profilePictureUrl ? (
                          <AvatarImage 
                            src={profilePictureUrl} 
                            alt={member.name}
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.src = robohashUrl;
                            }}
                          />
                        ) : (
                          <AvatarImage 
                            src={robohashUrl} 
                            alt={member.name}
                          />
                        )}
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                );
              })}
              {safeMembers.length > 5 && (
                <Link
                  href={`/main/divisions/${encodedDivision}/${encodedGroup}`}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center justify-center pt-2"
                >
                  View all {safeMembers.length} members
                </Link>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No members available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}