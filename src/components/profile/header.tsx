import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiEdit } from 'react-icons/fi';

interface ProfileHeaderProps {
  fullName: string;
  role: string;
  profilePicture?: string;
  lastSeen?: string;
  isOwnProfile: boolean;
  id: string;
}

// Generate robohash URL for missing profile pictures
const getRobohashUrl = (id: string) => {
  return `https://robohash.org/${id}?set=set3&size=300x300`;
};

// Clean Cloudinary URL to prevent concatenation issues
const cleanCloudinaryUrl = (url: string | undefined) => {
  if (!url) return null;
  
  // If the URL already contains the full Cloudinary URL, return it as is
  if (url.startsWith('https://res.cloudinary.com')) {
    return url;
  }
  
  // If it's just the path, return null to use robohash
  return null;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  id,
  fullName,
  role,
  profilePicture,
  lastSeen,
  isOwnProfile,
}) => {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeenTime, setLastSeenTime] = useState<string>('');
  const [bgImageSrc, setBgImageSrc] = useState<string>(getRobohashUrl(id));

  useEffect(() => {
    // Update online status and last seen time
    const updateLastSeen = () => {
      if (lastSeen) {
        const lastSeenDate = new Date(lastSeen);
        const now = new Date();
        const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
        // Online if lastSeen within 2 minutes
        setIsOnline(diffInMinutes < 2);
        if (diffInMinutes < 1) {
          setLastSeenTime('Just now');
        } else if (diffInMinutes < 60) {
          setLastSeenTime(`${Math.floor(diffInMinutes)} minutes ago`);
        } else if (diffInMinutes < 1440) { // Less than 24 hours
          const hours = Math.floor(diffInMinutes / 60);
          setLastSeenTime(`${hours} hour${hours > 1 ? 's' : ''} ago`);
        } else {
          setLastSeenTime(lastSeenDate.toLocaleDateString());
        }
      } else {
        setIsOnline(false);
        setLastSeenTime('No activity yet');
      }
    };
    updateLastSeen();
    const interval = setInterval(updateLastSeen, 60000); // Update every minute
    return () => {
      clearInterval(interval);
    };
  }, [lastSeen]);

  useEffect(() => {
    const cleanedUrl = cleanCloudinaryUrl(profilePicture);
    setBgImageSrc(cleanedUrl || getRobohashUrl(id));
  }, [profilePicture, id]);

  const handleEditClick = () => {
    router.push('/main/profile/edit');
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Ensure we have a valid URL for the profile picture
  const getProfilePictureUrl = () => {
    if (!profilePicture) return getRobohashUrl(id);
    if (typeof profilePicture === 'string') {
      if (profilePicture.startsWith('https://res.cloudinary.com')) {
        return profilePicture;
      }
      if (profilePicture.startsWith('blob:')) {
        return profilePicture;
      }
      if (profilePicture.startsWith('http')) {
        return profilePicture;
      }
    }
    return getRobohashUrl(id);
  };

  return (
    <div className="relative bg-blue-950 dark:bg-gray-900 rounded-lg shadow-sm mb-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-20 blur-sm">
        <Image 
          src={bgImageSrc}
          alt="background" 
          fill
          className="object-cover"
          onError={() => setBgImageSrc(getRobohashUrl(id))}
          unoptimized
        />
      </div>
  
      {/* Edit Button */}
      {isOwnProfile && (
        <div
          className="absolute top-2 right-2 z-50 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
          onClick={handleEditClick}
        >
          <FiEdit className="text-white text-lg" />
        </div>
      )}
      
      <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 p-4">
        <div className="relative">
          <Avatar className="border-4 border-white shadow-lg w-24 h-24 sm:w-28 sm:h-28">
            <AvatarImage 
              src={getProfilePictureUrl()}
              alt={fullName}
              className="rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getRobohashUrl(id);
              }}
            />
            <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </div>
        
        <div className="flex flex-col items-center sm:items-start">
          <h2 className="text-2xl sm:text-3xl font-bold text-white dark:text-gray-100">{fullName}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-sm sm:text-base text-white dark:text-gray-300 bg-blue-900 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {role}
            </span>
            <span className={`text-xs sm:text-sm px-2 py-0.5 rounded flex items-center gap-1.5 ${isOnline ? 'text-green-500' : 'text-white dark:text-gray-300'} bg-blue-900 dark:bg-gray-800`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              {isOnline ? 'Online' : `Last seen: ${lastSeenTime}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;