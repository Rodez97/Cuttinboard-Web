import React from "react";

function AvatarPlaceholder({
  userId,
}: { userId: string } & React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>) {
  const [initialSrc] = React.useState<string>(
    `https://api.dicebear.com/5.x/shapes/svg?seed=${userId}&background=%23ffffff&radius=50`
  );
  const [cachedSrc, setCachedSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    const sources = [initialSrc, "/images/room-service.png"];
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
  }, [initialSrc]);

  return <img src={cachedSrc || initialSrc} alt="User avatar" />;
}

export default AvatarPlaceholder;
