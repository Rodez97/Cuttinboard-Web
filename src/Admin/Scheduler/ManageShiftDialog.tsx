/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useState } from "react";
import {
  IEmployee,
  IShift,
  getShiftDayjsDate,
  getShiftLatestData,
} from "@cuttinboard-solutions/types-helpers";
import ShiftEditor, { ShiftFormDataType } from "./ShiftEditorFormik";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

export interface IManageShiftDialogRef {
  openNew: (employee: IEmployee, date: dayjs.Dayjs) => void;
  openEdit: (employee: IEmployee, shift: IShift) => void;
}

type State = {
  isOpen: boolean;
  employee: IEmployee;
  shift?: IShift;
  date: dayjs.Dayjs;
};

const ManageShiftDialog = forwardRef<IManageShiftDialogRef, unknown>(
  (_, ref) => {
    const [state, setState] = useState<State>({
      isOpen: false,
      employee: {} as IEmployee,
      date: dayjs(),
    });
    const [initialValues, setInitialValues] = useState<ShiftFormDataType>({
      applyTo: [],
      notes: "",
      position: "",
      start: dayjs(),
      end: dayjs(),
    });

    useImperativeHandle(ref, () => ({
      openNew: (employee: IEmployee, date: dayjs.Dayjs) => {
        const position =
          employee.positions && employee.positions.length === 1
            ? employee.positions[0]
            : "";

        setInitialValues({
          applyTo: [date.isoWeekday()],
          start: date.add(8, "hours"),
          end: date.add(16, "hours"),
          notes: "",
          position,
        });
        setState({
          isOpen: true,
          employee,
          date,
        });
      },
      openEdit: (employee: IEmployee, shiftRaw: IShift) => {
        const shift = getShiftLatestData(shiftRaw);
        const startDate = getShiftDayjsDate(shift, "start");
        const applyTo = [startDate.isoWeekday()];
        const notes = shift.notes;
        const position = shift.position;

        setInitialValues({
          applyTo,
          notes,
          position,
          start: startDate,
          end: getShiftDayjsDate(shift, "end"),
        });
        setState({
          isOpen: true,
          employee,
          shift,
          date: startDate,
        });
      },
    }));

    const handleClose = () => {
      setState({
        isOpen: false,
        employee: {} as IEmployee,
        date: dayjs(),
      });
    };

    return (
      <ShiftEditor
        {...state}
        onClose={handleClose}
        initialValues={initialValues}
      />
    );
  }
);

export default ManageShiftDialog;
