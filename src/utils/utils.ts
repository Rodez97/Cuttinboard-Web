import { Todo_Task } from "@cuttinboard-solutions/cuttinboard-library";
import { getAnalytics, logEvent } from "firebase/analytics";
import { orderBy } from "lodash";

export const getOrderedTasks = (tasks: Record<string, Todo_Task>) =>
  orderBy(Object.entries(tasks), (task) => task[1].createdAt, "asc");

export const recordError = (error: Error, fatal?: boolean) => {
  console.error({ error, fatal });
  const analytics = getAnalytics();
  if (!analytics) {
    return;
  }
  logEvent(analytics, "exception", {
    name: error.name,
    description: error.message,
    fatal,
  });
};

export const getAvatarByUID = (uid: string) =>
  `https://firebasestorage.googleapis.com/v0/b/cuttinboard-2021.appspot.com/o/users%2F${uid}%2Favatar?alt=media`;
