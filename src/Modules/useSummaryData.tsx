import { useEffect, useMemo, useState } from "react";
import { collectionData, docData } from "rxfire/firestore";
import { map, merge } from "rxjs";
import { collection, doc, Query, query, where } from "firebase/firestore";
import {
  FIRESTORE,
  recurringTaskDocConverter,
  useCuttinboardLocation,
  utensilConverter,
} from "@cuttinboard-solutions/cuttinboard-library";
import {
  extractRecurringTasksArray,
  IRecurringTask,
  IRecurringTaskDoc,
  IUtensil,
  recurringTaskIsToday,
} from "@cuttinboard-solutions/types-helpers";

// export type ScheduleTodaySummary = {
//   percent: number;
//   projectedSales: number;
// } & WageDataByDay[number];

// const defaultScheduleTodaySummary: ScheduleTodaySummary = {
//   normalHours: 0,
//   overtimeHours: 0,
//   totalHours: 0,
//   normalWage: 0,
//   overtimeWage: 0,
//   totalWage: 0,
//   totalShifts: 0,
//   people: 0,
//   percent: 0,
//   projectedSales: 0,
// };

export type RecurringTasksSummary = [string, IRecurringTask][];

type SummaryDataHook = [
  //ScheduleTodaySummary,
  RecurringTasksSummary,
  IUtensil[],
  boolean
];

type BaseEvent =
  | { type: "recurringTasks"; event: [string, IRecurringTask][] }
  | { type: "utensils"; event: IUtensil[] };
//| { type: "schedule"; event: ScheduleTodaySummary };

export function useSummaryData(): SummaryDataHook {
  const { location } = useCuttinboardLocation();
  // const [scheduleTodaySummary, setScheduleTodaySummary] =
  //   useState<ScheduleTodaySummary>(defaultScheduleTodaySummary);
  const [recurringTasksSummary, setRecurringTasksSummary] =
    useState<RecurringTasksSummary>([]);
  const [utensils, setUtensils] = useState<IUtensil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    //const weekId = dayjs().format(WEEKFORMAT);
    const recurringTaskDocRef = doc(
      FIRESTORE,
      "Locations",
      location.id,
      "globals",
      "recurringTasks"
    ).withConverter(recurringTaskDocConverter);
    const utensilsCollectionRef: Query<IUtensil> = query(
      collection(FIRESTORE, "Locations", location.id, "utensils"),
      where("percent", "<=", 33.33)
    ).withConverter(utensilConverter);
    // const scheduleRef = query(
    //   collection(FIRESTORE, "schedule"),
    //   where("weekId", "==", weekId),
    //   where("locationId", "==", location.id),
    //   limit(1)
    // ).withConverter(scheduleConverter);

    // const scheduleDocument$ = collectionData(scheduleRef).pipe(
    //   defaultIfEmpty(new Array<IScheduleDoc>()),
    //   map<IScheduleDoc[], BaseEvent>((schedule) => {
    //     const scheduleData: IScheduleDoc | null = schedule?.[0] ?? null;
    //     const isoWeekDay = dayjs().isoWeekday();
    //     if (scheduleData?.scheduleSummary?.byDay[isoWeekDay]) {
    //       const data = scheduleData.scheduleSummary.byDay[isoWeekDay];
    //       const projectedSales =
    //         scheduleData.projectedSalesByDay?.[isoWeekDay] ?? 0;
    //       const laborPercent = (data.totalWage / projectedSales) * 100;
    //       return {
    //         type: "schedule",
    //         event: {
    //           ...data,
    //           percent: isFinite(laborPercent) ? laborPercent : 0,
    //           projectedSales,
    //         },
    //       };
    //     } else {
    //       return {
    //         type: "schedule",
    //         event: defaultScheduleTodaySummary,
    //       };
    //     }
    //   })
    // );
    const recurringTaskDoc$ = docData(recurringTaskDocRef).pipe(
      map<IRecurringTaskDoc, BaseEvent>((recurringTaskDoc) => {
        const rTasks = recurringTaskDoc
          ? extractRecurringTasksArray(recurringTaskDoc).filter(([, task]) => {
              return recurringTaskIsToday(task);
            })
          : [];
        return {
          type: "recurringTasks",
          event: rTasks,
        };
      })
    );
    const utensilsCollection$ = collectionData(utensilsCollectionRef).pipe(
      map<IUtensil[], BaseEvent>((utensils) => {
        return {
          type: "utensils",
          event: utensils,
        };
      })
    );

    const combined$ = merge(
      //scheduleDocument$,
      recurringTaskDoc$,
      utensilsCollection$
    );

    const subscription = combined$.subscribe({
      next: (event) => {
        switch (event.type) {
          // case "schedule":
          //   setScheduleTodaySummary(event.event);
          //   break;
          case "recurringTasks":
            setRecurringTasksSummary(event.event);
            break;
          case "utensils":
            setUtensils(event.event);
            break;
        }
        setLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location]);

  // Use the useMemo hook to memoize the array of values returned by the hook
  const resArray = useMemo<SummaryDataHook>(
    () => [recurringTasksSummary, utensils, loading],
    [recurringTasksSummary, utensils, loading]
  );

  return resArray;
}
