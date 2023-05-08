import { UserOutlined } from "@ant-design/icons";
import { Avatar, AvatarProps } from "antd";
import React from "react";

function CuttinboardAvatar(props: AvatarProps) {
  return <Avatar size={35} {...props} icon={<UserOutlined />} />;
}

export default CuttinboardAvatar;
