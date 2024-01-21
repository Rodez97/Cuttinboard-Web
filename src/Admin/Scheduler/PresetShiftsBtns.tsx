/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useCuttinboardLocation } from "@rodez97/cuttinboard-library";
import { Button, Space } from "antd/es";
import dayjs from "dayjs";
import { useCallback } from "react";

function PresetShiftsButtons({
  date,
  onChange,
}: {
  date: dayjs.Dayjs;
  onChange: (range: { start: dayjs.Dayjs; end: dayjs.Dayjs }) => void;
}) {
  const { scheduleSettings } = useCuttinboardLocation();

  const handleOnClick = useCallback(
    (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
      onChange({ start, end });
    },
    [onChange]
  );

  const renderPresetTimes = useCallback(
    (
      presetTime: {
        start: string;
        end: string;
      },
      index: number
    ) => {
      const startTime = dayjs(presetTime.start, "HH:mm");
      const endTime = dayjs(presetTime.end, "HH:mm");
      // create moment objects for the start and end times based on the current date
      const startMoment = date
        .set("hour", startTime.hour())
        .set("minute", startTime.minute());
      const endMoment = date
        .set("hour", endTime.hour())
        .set("minute", endTime.minute());
      // If the end time is before the start time, add a day to the end time
      if (endMoment.isBefore(startMoment)) {
        endMoment.add(1, "day");
      }
      // Create a string for the button label based on the preset times as 12 hour time (e.g. 9:00 AM - 5:00 PM)
      const label = `${startTime.format("h:mm A")} - ${endTime.format(
        "h:mm A"
      )}`;

      return (
        <Button
          key={index}
          type="dashed"
          onClick={() => {
            handleOnClick(startMoment, endMoment);
          }}
        >
          {label}
        </Button>
      );
    },
    [date, handleOnClick]
  );

  if (!scheduleSettings?.presetTimes) {
    return null;
  }

  return (
    <Space
      wrap
      css={{
        marginTop: 10,
      }}
    >
      {scheduleSettings.presetTimes.map(renderPresetTimes)}
    </Space>
  );
}

export default PresetShiftsButtons;
