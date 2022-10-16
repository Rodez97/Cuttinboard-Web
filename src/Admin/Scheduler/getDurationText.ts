export const getDurationText = (durationMinutes: number) => {
  const total = (durationMinutes / 60).toFixed(2).split(".");
  const hoursText = total[0];
  const minutesText = (
    (Number.parseInt(total[1] ? total[1] : "0") / 100) *
    60
  ).toFixed();
  return `${hoursText}h ${minutesText}min`;
};
