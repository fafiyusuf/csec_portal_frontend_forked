"use client";

import { Avatar } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/userStore";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiChevronDown, FiMenu } from "react-icons/fi";

interface TopHeaderProps {
  onMenuClick: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUserStore();
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const getGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) {
        return "Good Morning";
      } else if (currentHour >= 12 && currentHour < 17) {
        return "Good Afternoon";
      } else {
        return "Good Evening";
      }
    };

    const updateGreeting = () => {
      setGreeting(getGreeting());
    };

    updateGreeting();
    const intervalId = setInterval(updateGreeting, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleNavigation = (path: string) => {
    setIsDropdownOpen(false);
    if (path === "/main/profile") {
      router.push(`/main/profile`);
    } else {
      router.push(path);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const getPageTitle = () => {
    const pathSegments = pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];

    switch (lastSegment) {
      case "members":
        return "All Members";
      case "divisions":
        return "All Divisions";
      case "attendance":
        return "Attendances";
      case "events":
        return "Seasons & Events";
      case "resources":
        return "Resources";
      case "profile":
        return "Profile";
      case "admin":
        return "Administration";
      case "settings":
        return "Settings";
      default:
        return user?.member?.firstName || "Dashboard";
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-4 lg:px-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between gap-4">
        {/* Left - Menu Button and Greeting */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiMenu className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {greeting || "Loading..."}
            </p>
          </div>
        </div>

        {/* Right - Profile */}
        <div className="flex items-center gap-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Avatar size="md" robohashSet="set3">
                <Avatar.Image
                  src={
                    (typeof user?.member?.profilePicture === 'string' ? user.member.profilePicture : undefined) ||
                    `https://robohash.org/${user?.member?._id || "default"}?set=set3&size=100x100`
                  }
                  alt="User Avatar"
                  identifier={user?.member?._id || "default"}
                />
                <Avatar.Fallback className="dark:bg-gray-600 dark:text-white">
                  {user?.member?.firstName?.[0]}
                  {user?.member?.lastName?.[0]}
                </Avatar.Fallback>
              </Avatar>
              
              <div className="hidden sm:flex items-center">
                <div 
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigation("/main/profile");
                  }}
                >
                  <p className="text-sm font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                    {user?.member?.firstName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.member?.clubRole || "Member"}
                  </p>
                </div>
                <FiChevronDown
                  className={`h-4 w-4 ml-1 text-gray-500 dark:text-gray-400 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-100 dark:border-gray-700 z-10">
                <button
                  onClick={() => handleNavigation("/main/profile")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Profile
                </button>
                <button
                  onClick={() => handleNavigation("/main/settings")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-200 dark:hover:bg-red-500/20"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
