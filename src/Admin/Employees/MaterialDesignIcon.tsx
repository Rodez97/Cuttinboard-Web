import React from "react";
import Icon from "@ant-design/icons";
import { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

export default ({
  path,
  ...props
}: Partial<CustomIconComponentProps> & { path: string }) => {
  const ByPath = () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <path d={path} />
    </svg>
  );
  return <Icon component={ByPath} {...props} />;
};
