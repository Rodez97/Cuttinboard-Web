import {
  Attachment,
  Message,
} from "@cuttinboard-solutions/cuttinboard-library/models";

export interface BaseMediaProps {
  message?: Message & { type: "attachment" | "mediaUri" };
}
