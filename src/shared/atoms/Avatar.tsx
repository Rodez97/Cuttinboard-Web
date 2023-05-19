import { Avatar, AvatarProps } from "antd/es";
import React from "react";
import imgAvatar from "../../assets/images/avatar.webp";

function CuttinboardAvatar({ src, ...props }: AvatarProps) {
  return <Avatar size={35} {...props} src={src ? src : imgAvatar} />;
}

export default CuttinboardAvatar;
