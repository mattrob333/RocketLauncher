import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

const UserAvatar: React.FC = () => {
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src="/path-to-user-image.jpg" alt="User" />
      <AvatarFallback>
        <User className="h-6 w-6" />
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
