'use client';
import LoadingSpinner from '@/components/LoadingSpinner';
import Attendance from '@/components/profile/attendance';
import ProfileHeader from '@/components/profile/header';
import HeadsUp from '@/components/profile/headsup';
import OptionalInfo from '@/components/profile/optionalinfo';
import Progress from '@/components/profile/progress';
import RequiredInfo from '@/components/profile/requiredinfo';
import { useUserStore } from '@/stores/userStore';
import { Member } from '@/types/member';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiInfo, FiUser as FiProfile, FiInfo as FiRequired } from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { LuClipboardList } from 'react-icons/lu';
import { MdEventAvailable } from 'react-icons/md';

interface MemberProfilePageProps {
  params: {
    memberId: string;
  };
}

const MemberProfilePage = ({ params }: MemberProfilePageProps) => {
  const { memberId } = params;
  const router = useRouter();
  const [activeView, setActiveView] = useState<'profile' | 'attendance' | 'progress' | 'headsup'>('profile');
  const [activeTab, setActiveTab] = useState<'required' | 'optional'>('required');
  const [tabHistory, setTabHistory] = useState<('required' | 'optional')[]>(['required']);
  const [viewHistory, setViewHistory] = useState<('profile' | 'attendance' | 'progress' | 'headsup')[]>(['profile']);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        if (!memberId || memberId === 'undefined') {
          throw new Error('Invalid member ID');
        }
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/members/${memberId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useUserStore.getState().token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        const memberData = await res.json();
        setMember(memberData.member);

        // Update lastSeen for the viewed member
        if (memberId !== user?.member?._id) {
          try {
            await fetch(`${API_BASE_URL}/members/${memberId}/lastSeen`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${useUserStore.getState().token}`,
              },
              body: JSON.stringify({ lastSeen: new Date().toISOString() }),
            });
          } catch (error) {
            console.error('Failed to update last seen:', error);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load member data');
      } finally {
        setLoading(false);
      }
    };
    fetchMemberData();
  }, [memberId, user?.member.refreshToken]);

  const handleTabChange = (tab: 'required' | 'optional') => {
    setActiveTab(tab);
    setTabHistory(prev => [...prev, tab]);
  };

  const handleViewChange = (view: 'profile' | 'attendance' | 'progress' | 'headsup') => {
    setViewHistory(prev => [...prev, view]);
    setActiveView(view);
    if (view === 'profile') {
      setTabHistory(['required']);
    }
  };

  const handleBack = () => {
    if (activeView === 'profile') {
      if (tabHistory.length > 1) {
        const newHistory = [...tabHistory];
        newHistory.pop();
        setTabHistory(newHistory);
        setActiveTab(newHistory[newHistory.length - 1]);
      } else {
        router.back();
      }
    } else {
      if (viewHistory.length > 1) {
        const newHistory = [...viewHistory];
        newHistory.pop();
        setViewHistory(newHistory);
        setActiveView(newHistory[newHistory.length - 1]);
      } else {
        setActiveView('profile');
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!member) return <div className="p-6 text-red-500">Member not found.</div>;

  const requiredData = {
    profilePicture: member.profilePicture?.toString() || `https://robohash.org/${member._id}?set=set3`,
    firstName: member.firstName || 'Not provided',
    lastName: member.lastName || 'Not provided',
    phoneNumber: member.phoneNumber || 'Not provided',
    email: member.email || 'Not provided',
    department: member.department || 'Not provided',
    graduation: member.graduationYear || 'Not provided',
    birth: member.birthDate || 'Not provided',
    gender: member.gender || 'Not provided',
    telegramUsername: member.telegramHandle || 'Not provided',
    joinedDate: member.createdAt || 'Not provided',
  };
  const optionalData = {
    uniId: member.universityId || 'Not provided',
    linkedin: member.linkedinHandle || 'Not provided',
    codeforces: member.codeforcesHandle || 'Not provided',
    leetcode: member.leetcodeHandle || 'Not provided',
    insta: member.instagramHandle || 'Not provided',
    birthdate: member.birthDate || 'Not provided',
    cv: member.cv || 'Not provided',
    joinedDate: member.createdAt || 'Not provided',
    shortbio: member.bio || 'Not provided',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg">
          <div className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/30 sticky top-[64px] z-[5]">
            <div className="px-6">
              <div className="flex items-center justify-between py-4">
                <button
                  onClick={handleBack}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                >
                  <span className="text-sm font-medium">Back</span>
                </button>
              </div>
              <div className="pb-6 pt-4">
                <ProfileHeader
                  fullName={`${member.firstName} ${member.lastName}`}
                  role={member.clubRole || 'Member'}
                  isOwnProfile={user?.member?._id === member._id}
                  profilePicture={member.profilePicture?.toString()}
                  id={member._id || ''}
                  lastSeen={member.lastSeen ? member.lastSeen : undefined}
                />
              </div>
              <div className="flex space-x-4 border-b dark:border-gray-700 pb-4">
                <button
                  onClick={() => handleViewChange('profile')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeView === 'profile'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FiProfile className="mr-2" />
                  <span className="text-sm font-medium">Profile</span>
                </button>
                <button
                  onClick={() => handleViewChange('attendance')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeView === 'attendance'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <MdEventAvailable className="mr-2" />
                  <span className="text-sm font-medium">Attendance</span>
                </button>
                <button
                  onClick={() => handleViewChange('progress')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeView === 'progress'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <HiOutlineDocumentText className="mr-2" />
                  <span className="text-sm font-medium">Progress</span>
                </button>
                <button
                  onClick={() => handleViewChange('headsup')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeView === 'headsup'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <LuClipboardList className="mr-2" />
                  <span className="text-sm font-medium">Heads Up</span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {activeView === 'profile' ? (
              <>
                <div className="flex space-x-4 border-b dark:border-gray-700">
                  <button
                    onClick={() => handleTabChange('required')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'required'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <FiRequired className="inline mr-2" />
                    Required Information
                  </button>
                  <button
                    onClick={() => handleTabChange('optional')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'optional'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <FiInfo className="inline mr-2" />
                    Optional Information
                  </button>
                </div>
                <div className="mt-6">
                  {activeTab === 'required' && <RequiredInfo member={requiredData} />}
                  {activeTab === 'optional' && <OptionalInfo member={optionalData} />}
                </div>
              </>
            ) : activeView === 'attendance' ? (
              <Attendance id={member._id} />
            ) : activeView === 'progress' ? (
              <Progress id={member._id} />
            ) : (
              <HeadsUp id={member._id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfilePage;