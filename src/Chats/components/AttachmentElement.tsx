import ImageMessage from "./MessageElements/ImageMessage";
import VideoMessage from "./MessageElements/VideoMessage";
import React from "react";

function AttachmentElement({
  contentType,
  sourceUrl,
}: {
  contentType: "image" | "video" | "youtube";
  sourceUrl: string;
}) {
  switch (contentType) {
    case "image":
      return <ImageMessage src={sourceUrl} />;
    case "video":
    case "youtube":
      return <VideoMessage src={sourceUrl} />;
    default:
      return null;
  }
}

// Export memoized component
export default React.memo(AttachmentElement);
