import { Attachment } from "@cuttinboard/cuttinboard-library/models";

export interface BaseMediaProps {
  source: string;
  uploaded: boolean;
  onReply?: () => void;
  name?: string;
  attachment?: Attachment;
  id?: string;
  onUrlPress?: (url: string) => void;
  message?: string;
}
