"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Head } from "@/types/admin";

export const HeadsTable = ({
  heads,
  onEdit,
  onBan,
}: {
  heads: Head[];
  onEdit: (head: Head) => void;
  onBan: (id: string) => void;
}) => {
  return (
    <div className="border rounded-lg overflow-hidden text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50">
      <table className="w-full">
        <thead className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Role</th>
            <th className="p-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {heads.map((head) => (
            <tr key={head.id} className="border-b text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={head.avatar || ""} alt={head.name} />
                    <AvatarFallback>
                      {head.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{head.name}</span>
                </div>
              </td>
              <td className="p-4">{head.role}</td>
              <td className="p-4">
                <Badge variant={head.membershipStatus === "active" ? "default" : "destructive"}>
                  {head.membershipStatus}
                </Badge>
              </td>
             
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};