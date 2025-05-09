// components/Sidebar.tsx
'use client';

import cse from "@/assets/logo.svg";
import { useSettingsStore } from '@/stores/settingsStore';
import { useUserStore } from '@/stores/userStore';
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
    <aside className={`h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <Link href="/main/dashboard" className="flex items-center space-x-2">
            <Image src={cse} alt="CSEC Logo" width={32} height={32} />
            <span className="text-xl font-bold text-gray-800 dark:text-white">CSEC Portal</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    // Close mobile menu when a link is clicked
                    if (window.innerWidth < 1024) {
                      const event = new Event('click');
                      document.dispatchEvent(event);
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
          <div className="mt-4 md:mt-6 mb-2 md:mb-4">
            <div className="flex items-center justify-between p-1 md:p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center w-full py-1 md:py-2 px-2 md:px-4 rounded-md text-sm md:text-base ${
                  theme === 'light' 
                    ? 'bg-[#003087] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FiSun className="mr-1 md:mr-2" />
                <span className="hidden sm:inline">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center w-full py-1 md:py-2 px-2 md:px-4 rounded-md text-sm md:text-base ${
                  theme === 'dark' 
                    ? 'bg-[#003087] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <GoMoon className="mr-1 md:mr-2" />
                <span className="hidden sm:inline">Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}