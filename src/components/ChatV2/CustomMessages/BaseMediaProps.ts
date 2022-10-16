import {
  Message,
  ReplyRecipient,
} from "@cuttinboard-solutions/cuttinboard-library/models";

export interface BaseMediaProps {
  message?: Message | ReplyRecipient;
}
