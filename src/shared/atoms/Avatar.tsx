import { AvatarProps, Avatar as AntDAvatar } from "antd";
import React from "react";

function CuttinboardAvatar({
  userId,
  src,
  ...props
}: AvatarProps & { userId: string; src?: string }) {
  const [initialSrc, setInitialSrc] = React.useState<string | undefined>(src);
  const [cachedSrc, setCachedSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    let sources = [
      `https://api.dicebear.com/5.x/shapes/svg?seed=${userId}&background=%23ffffff&radius=50`,
      "/images/room-service.png",
    ];

    if (initialSrc) {
      sources = [initialSrc, ...sources];
    } else {
      setInitialSrc(sources[0]);
    }

    let currentSourceIndex = 0;

    const fetchImage = () => {
      const currentSource = sources[currentSourceIndex];
      caches.match(currentSource).then((response) => {
        if (response) {
          setCachedSrc(response.url);
        } else {
          fetch(currentSource)
            .then((response) => response.blob())
            .then((blob) => {
              const objectUrl = URL.createObjectURL(blob);
              caches.open("avatar-cache").then((cache) => {
                cache.put(currentSource, new Response(blob));
                setCachedSrc(objectUrl);
              });
            })
            .catch(() => {
              if (currentSourceIndex < sources.length - 1) {
                currentSourceIndex++;
                fetchImage();
              }
            });
        }
      });
    };

    fetchImage();
  }, [initialSrc, userId]);

  return <AntDAvatar {...props} src={cachedSrc || initialSrc} />;
}

export default CuttinboardAvatar;
