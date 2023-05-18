import { Avatar, AvatarProps } from "antd";
import React from "react";
import { imgAvatar } from "../../assets/images";

function CuttinboardAvatar({ src, ...props }: AvatarProps) {
  return <Avatar size={35} {...props} src={src ? src : imgAvatar} />;
}

export default CuttinboardAvatar;
