"use client";
import { UserAvatar } from "@/entities/user";
import { useCurrentUserProfile } from "@/features/user";
import {
  Logo,
  MessageIcon,
  NotificationIcon,
  SearchIcon,
} from "@/shared/ui/icons";
import { Input } from "@/shared/ui/input";

export const MainHeader = () => {
  const { data: userProfile } = useCurrentUserProfile();
  if (!userProfile) return null;

  return (
    <div className="container flex items-center justify-between p-4">
      <div className="flex items-center space-x-2 text-2xl font-bold text-slate-600 cursor-pointer hover:text-teal-600">
        <Logo />
        <span>MomentHub</span>
      </div>

      <div className="relative w-1/3">
        <Input type="text" placeholder="Search" className="w-full" />
        <SearchIcon className="h-5 w-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-slate-700 hover:text-teal-600 text-xl">
          <MessageIcon className="h-6 w-6 cursor-pointer" />
        </button>
        <button className="text-slate-700 hover:text-teal-600 text-xl">
          <NotificationIcon className="h-6 w-6 cursor-pointer" />
        </button>

        <UserAvatar
          userProfileImage={userProfile?.profileImage}
          className="w-8 h-8 cursor-pointer relative"
        />
      </div>
    </div>
  );
};
