import {
  Message,
  ReplyRecipient,
} from "@cuttinboard-solutions/cuttinboard-library/chats";

export interface BaseMediaProps {
  message: Message | ReplyRecipient;
}
