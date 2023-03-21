import { useEffect, useMemo, useState } from "react";
import { collectionData, docData } from "rxfire/firestore";
import { combineLatest, map } from "rxjs";
import { collection, doc, Query, query, where } from "firebase/firestore";
import dayjs from "dayjs";
import {
  DATABASE,
  FIRESTORE,
  recurringTaskDocConverter,
  useCuttinboardLocation,
  utensilConverter,
} from "@cuttinboard-solutions/cuttinboard-library";
import { ref } from "firebase/database";
import { object } from "rxfire/database";
import {
  extractRecurringTasksArray,
  IRecurringTask,
  IScheduleDoc,
  IUtensil,
  recurringTaskIsToday,
  WageDataByDay,
  WEEKFORMAT,
} from "@cuttinboard-solutions/types-helpers";

export type ScheduleTodaySummary = {
  percent: number;
  projectedSales: number;
} & WageDataByDay[number];

const defaultScheduleTodaySummary: ScheduleTodaySummary = {
  normalHours: 0,
  overtimeHours: 0,
  totalHours: 0,
  normalWage: 0,
  overtimeWage: 0,
  totalWage: 0,
  totalShifts: 0,
  people: 0,
  percent: 0,
  projectedSales: 0,
};

export type RecurringTasksSummary = [string, IRecurringTask][];

type SummaryDataHook = [
  ScheduleTodaySummary,
  RecurringTasksSummary,
  IUtensil[],
  boolean
];

export function useSummaryData(): SummaryDataHook {
  const { location } = useCuttinboardLocation();
  const [scheduleTodaySummary, setScheduleTodaySummary] =
    useState<ScheduleTodaySummary>(defaultScheduleTodaySummary);
  const [recurringTasksSummary, setRecurringTasksSummary] =
    useState<RecurringTasksSummary>([]);
  const [utensils, setUtensils] = useState<IUtensil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const weekId = dayjs().format(WEEKFORMAT);
    const scheduleRef = ref(DATABASE, `schedule/${weekId}/${location.id}`);
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

    const scheduleDocument$ = object(scheduleRef).pipe(
      map(({ snapshot }) => {
        const scheduleData: IScheduleDoc | null = snapshot.val();
        const isoWeekDay = dayjs().isoWeekday();
        if (scheduleData?.scheduleSummary.byDay[isoWeekDay]) {
          const data = scheduleData.scheduleSummary.byDay[isoWeekDay];
          const projectedSales =
            scheduleData.projectedSalesByDay?.[isoWeekDay] ?? 0;
          const laborPercent = (data.totalWage / projectedSales) * 100;
          return {
            ...data,
            percent: isFinite(laborPercent) ? laborPercent : 0,
            projectedSales,
          };
        } else {
          return defaultScheduleTodaySummary;
        }
      })
    );
    const recurringTaskDoc$ = docData(recurringTaskDocRef).pipe(
      map((recurringTaskDoc) =>
        recurringTaskDoc
          ? extractRecurringTasksArray(recurringTaskDoc).filter(([, task]) => {
              return recurringTaskIsToday(task);
            })
          : []
      )
    );
    const utensilsCollection$ = collectionData(utensilsCollectionRef);

    const combined$ = combineLatest([
      scheduleDocument$,
      recurringTaskDoc$,
      utensilsCollection$,
    ]);

    const subscription = combined$.subscribe(
      ([scheduleDocument, employeeShiftsCollection, utensils]) => {
        setLoading(false);
        setScheduleTodaySummary(scheduleDocument);
        setRecurringTasksSummary(employeeShiftsCollection);
        setUtensils(utensils);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [location]);

  // Use the useMemo hook to memoize the array of values returned by the hook
  const resArray = useMemo<SummaryDataHook>(
    () => [scheduleTodaySummary, recurringTasksSummary, utensils, loading],
    [scheduleTodaySummary, recurringTasksSummary, utensils, loading]
  );

  return resArray;
}
