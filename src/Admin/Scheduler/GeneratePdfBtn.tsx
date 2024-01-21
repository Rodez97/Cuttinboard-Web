import {
  useCuttinboardLocation,
  useSchedule,
} from "@rodez97/cuttinboard-library";
import { message } from "antd/es";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { logAnalyticsEvent } from "../../utils/analyticsHelpers";
import { generateSchedulePdf } from "./NewPDF";
import { recordError } from "../../utils/utils";
import { getTotalWageData } from "@rodez97/types-helpers";

function useGeneratePdfBtn() {
  const { t } = useTranslation();
  const { location, scheduleSettings } = useCuttinboardLocation();
  const { weekId, employeeShifts, weekDays, loading, shifts } = useSchedule();
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const generatePdf = useCallback(async () => {
    const empDocs = employeeShifts.filter(
      (e) => e.shifts && e.shifts.length > 0
    );
    if (empDocs.length === 0) {
      return message.error(t("There are no employees scheduled"));
    }
    try {
      setGeneratingPDF(true);
      const wageData = getTotalWageData(shifts, scheduleSettings);
      await generateSchedulePdf(
        empDocs,
        location.name,
        weekId,
        weekDays,
        wageData
      );
      logAnalyticsEvent("schedule_pdf_generated");
    } catch (error) {
      recordError(error);
    } finally {
      setGeneratingPDF(false);
    }
  }, [
    employeeShifts,
    shifts,
    scheduleSettings,
    location.name,
    weekId,
    weekDays,
    t,
  ]);

  return {
    generatePdf,
    generatingPDF: generatingPDF || loading,
  };
}

export default useGeneratePdfBtn;
