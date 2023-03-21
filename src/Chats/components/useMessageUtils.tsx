import { useMemo } from "react";
import { isEqual } from "lodash";
import dayjs from "dayjs";
import { IMessage } from "@cuttinboard-solutions/types-helpers";

const useMessageUtils = (currentMessage: IMessage, prevMessage?: IMessage) => {
  const showSender = useMemo(() => {
    if (!currentMessage?.user) {
      return false;
    }

    // Check if there is no previous message or if the current message is the last in the array
    // If either of these conditions is true, return true
    if (!prevMessage) {
      return true;
    }

    // Check if the previous message is a system message
    // or if the current message is the last in the array
    // or if the sender of the previous message is different from the current message's sender
    // or if the sender's name of the previous message is different from the current message's sender's name
    return (
      prevMessage.systemType !== undefined ||
      !isEqual(prevMessage.user, currentMessage.user)
    );
  }, [currentMessage.user, prevMessage]);

  const showDate = useMemo(() => {
    if (!currentMessage?.user) {
      return false;
    }

    // Check if there is no previous message or if the current message is the last in the array
    // If either of these conditions is true, return true
    if (!prevMessage) {
      return true;
    }

    // If there is a previous message and the current message is not the last in the array
    // Check if the difference in hours between the current message's and previous message's creation date is greater than 5
    // or if the current message's and previous message's creation date are not on the same day
    return (
      dayjs(currentMessage.createdAt).diff(prevMessage?.createdAt, "hours") >
        5 ||
      !dayjs(currentMessage.createdAt).isSame(prevMessage?.createdAt, "day")
    );
  }, [currentMessage?.user, currentMessage.createdAt, prevMessage]);

  return {
    showSender,
    showDate,
  };
};

export default useMessageUtils;
