import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards";
import { useUserStore } from "@/stores/userStore";
import { Plus } from "lucide-react";
import Link from "next/link";

interface DivisionCardProps {
  division: string | {
    name: string;
    groups?: string[];
    memberCount: number;
    groupMemberCounts?: { [key: string]: number };
  };
  groupCount?: number;
  memberCount?: number;
  onAddMember?: () => void;
}

export function DivisionCard({ division, groupCount, memberCount, onAddMember }: DivisionCardProps) {
  const { user, hasRole, hasDivisionAccess } = useUserStore();
  const divisionName = typeof division === 'string' ? division : division.name;
  const canAddMembers = user?.member?.clubRole === 'President' || 
                       user?.member?.clubRole === 'Vice President' ||
                       (user?.member?.clubRole?.includes('President') && hasDivisionAccess(divisionName as any));

  return (
    <Card className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-gray-900 dark:text-white">{divisionName}</CardTitle>
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
              href={`/main/divisions/${encodeURIComponent(divisionName)}`}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center"
            >
              View All
            </Link>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {typeof memberCount === 'number' ? memberCount : (typeof division === 'string' ? 0 : division.memberCount || 0)} total members
        </p>
        {typeof groupCount === 'number' && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {groupCount} groups
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
          {typeof division !== 'string' && (
            <>
              Total groups: {division.groups?.length || 0} | Total students: {Array.isArray(division.groups) ? division.groups.reduce((acc: number, group: any) => acc + (typeof group === 'string' ? (division.groupMemberCounts?.[group] || 0) : (group.memberCount || 0)), 0) : 0}
            </>
          )}
        </div>
        <div className="space-y-2">
          {typeof division !== 'string' && Array.isArray(division.groups) && division.groups.map((group: any) => {
            const groupName = group.group || group.name || group;
            const groupMembers = group.memberCount || 0;
            return (
              <Link
                key={`${division.name}-${groupName}`}
                href={`/main/divisions/${encodeURIComponent(division.name)}/${encodeURIComponent(groupName)}`}
                className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-200">{groupName}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {groupMembers} students
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}