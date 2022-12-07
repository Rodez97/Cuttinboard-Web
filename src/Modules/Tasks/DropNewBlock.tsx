/** @jsx jsx */
import { jsx } from "@emotion/react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";
import { useDrop } from "react-dnd";
import { recordError } from "../../utils/utils";
import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import {
  Colors,
  FIRESTORE,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  ChecklistGroup,
  RecurringTask,
} from "@cuttinboard-solutions/cuttinboard-library/checklist";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";

export default ({ tasks }: { tasks: ChecklistGroup }) => {
  const { t } = useTranslation();
  const { location } = useCuttinboardLocation();
  const { user } = useCuttinboard();

  const addBlock = async (recurringTask: {
    id: string;
    task: RecurringTask;
  }) => {
    try {
      if (tasks) {
        await tasks.addChecklist(nanoid(), {
          name: recurringTask.task.name,
          id: recurringTask.id,
        });
      } else {
        // If we don't have a checklist, we're creating a new one
        await setDoc(
          doc(
            FIRESTORE,
            "Organizations",
            location.organizationId,
            "tasks",
            location.id
          ),
          {
            checklists: {
              [nanoid()]: {
                name: `Task Block #1`,
                createdAt: serverTimestamp(),
                createdBy: user.uid,
                order: 1,
                tasks: {
                  [recurringTask.id]: {
                    name: recurringTask.task.name,
                    status: false,
                    order: 1,
                    createdAt: serverTimestamp(),
                  },
                },
              },
            },
            locationId: location.id,
          }
        );
      }
    } catch (error) {
      recordError(error);
    }
  };
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: "recurringTask",
      drop: (recurringTask: { id: string; task: RecurringTask }) => {
        console.log("Dropped", recurringTask);
        addBlock(recurringTask);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [tasks]
  );

  return (
    <div
      ref={drop}
      css={{
        border: "1px dotted #00000050",
        minWidth: 300,
        maxWidth: 900,
        margin: "auto",
        width: "100%",
        display: canDrop ? "flex" : "none",
        justifyContent: "center",
        marginTop: 20,
        padding: 20,
        backgroundColor: isOver ? Colors.Green.Light : Colors.Blue.Light,
      }}
    >
      <Typography.Text type="secondary">{t("New Task List")}</Typography.Text>
    </div>
  );
};
