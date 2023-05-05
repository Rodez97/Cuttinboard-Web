import { AvatarProps, Avatar as AntDAvatar } from "antd";
import React from "react";
import useSWR from "swr";

function CuttinboardAvatar({
  userId,
  src,
  ...props
}: AvatarProps & { userId: string; src?: string }) {
  const [initialSrc, setInitialSrc] = React.useState<string | undefined>(src);
  const [cachedSrc, setCachedSrc] = React.useState<string | null>(null);

  const { data } = useSWR(
    initialSrc
      ? initialSrc
      : `https://api.dicebear.com/5.x/shapes/svg?seed=${userId}&background=%23ffffff&radius=50`,
    async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      return objectUrl;
    },
    {
      revalidateOnMount: true,
      dedupingInterval: 10000,
      refreshInterval: 3600000,
      refreshWhenOffline: false,
      shouldRetryOnError: false,
      errorRetryInterval: 30000,
      errorRetryCount: 5,
    }
  );

  React.useEffect(() => {
    if (data) {
      setCachedSrc(data);
    }
  }, [data]);

  React.useEffect(() => {
    if (src && isUrl(src)) {
      setInitialSrc(src);
    }
  }, [src]);

  return <AntDAvatar {...props} src={cachedSrc || initialSrc} />;
}

function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export default CuttinboardAvatar;
