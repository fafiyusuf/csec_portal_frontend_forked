// components/Sidebar.tsx
'use client';

import cse from "@/assets/logo.svg";
import { useSettingsStore } from '@/stores/settingsStore';
import { useUserStore } from '@/stores/userStore';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FiLayers,
  FiSettings,
  FiSun,
  FiUsers,
} from 'react-icons/fi';
import { GoMoon } from 'react-icons/go';
import { HiOutlineUsers } from "react-icons/hi2";
import { IoFolderOutline } from "react-icons/io5";
import { LuCalendarCheck, LuClock10, LuSettings2 } from "react-icons/lu";
import { MdOutlineDashboard } from 'react-icons/md';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/main/dashboard', icon: <MdOutlineDashboard className="mr-3" /> },
  { name: 'All Members', href: '/main/members', icon: <FiUsers className="mr-3" /> },
  { name: 'All Divisions', href: '/main/divisions', icon: <FiLayers className="mr-3" /> },
  { 
    name: 'Attendances', 
    href: '/main/attendance',
    headOnly: true,
    icon: <LuCalendarCheck className="mr-3" /> 
  },
  { name: 'Sessions & Events', href: '/main/events', icon: <LuClock10 className="mr-3" /> },
  { name: 'Resources', href: '/main/resources', icon: <IoFolderOutline className="mr-3" /> },
  { name: 'Profile', href: '/main/profile', icon: <HiOutlineUsers className="mr-3" /> },
  { 
    name: 'Administration', 
    href: '/main/admin',
    icon: <LuSettings2 className="mr-3" />, 
    adminOnly: true
  },
  { name: 'Settings', href: '/main/settings', icon: <FiSettings className="mr-3" /> },
];

export default function Sidebar({ isMobileMenuOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUserStore();
  const { theme, setTheme } = useSettingsStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly) {
      return user?.member?.clubRole === 'President' || user?.member?.clubRole === 'Vice President';
    }
    return true;
  });

  const isActive = (href: string) => {
    if (href === '/main/admin') {
      return pathname.startsWith('/main/admin');
    }
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  if (!isMounted) return null;

  return (
    <aside className={`fixed lg:static h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out ${
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/main/dashboard" className="flex items-center space-x-2">
            <Image src={cse} alt="CSEC Logo" width={32} height={32} className="w-8 h-8 sm:w-10 sm:h-10" />
            <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">CSEC Portal</span>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-1 rounded-lg bg-gray-100 dark:bg-gray-700">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center w-full py-2 px-3 rounded-md text-sm transition-colors ${
                theme === 'light' 
                  ? 'bg-[#003087] text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FiSun className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="ml-2 hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center w-full py-2 px-3 rounded-md text-sm transition-colors ${
                theme === 'dark' 
                  ? 'bg-[#003087] text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <GoMoon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="ml-2 hidden sm:inline">Dark</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}