/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Layout, Space, Tabs } from "antd";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import ErrorPage from "../../shared/molecules/PageError";
import LoadingPage from "../../shared/molecules/LoadingPage";
import { useTranslation } from "react-i18next";
import { GrayPageHeader } from "../../shared";
import TasksMain from "./TasksMain";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { capitalize } from "lodash";
import dayjs from "dayjs";
import {
  FIRESTORE,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { ClockCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useRef } from "react";
import ManagePeriodicTask, {
  ManagePeriodicTaskRef,
} from "./ManagePeriodicTask";
import PeriodicTasksList from "./PeriodicTasksList";
import { recordError } from "../../utils/utils";
import { nanoid } from "nanoid";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  ChecklistGroup,
  RecurringTaskDoc,
} from "@cuttinboard-solutions/cuttinboard-library/checklist";

export default () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useCuttinboard();
  const { location, locationAccessKey } = useCuttinboardLocation();
  const managePeriodicTaskRef = useRef<ManagePeriodicTaskRef>(null);
  const scrollBottomTarget = useRef<HTMLDivElement>(null);
  const [recurringTaskDoc, loading, error] = useDocumentData<RecurringTaskDoc>(
    doc(
      FIRESTORE,
      "Organizations",
      location.organizationId,
      "recurringTasks",
      location.id
    ).withConverter(RecurringTaskDoc.firestoreConverter)
  );
  const [tasks, loadingTasks, errorTasks] = useDocumentData<ChecklistGroup>(
    doc(
      FIRESTORE,
      "Organizations",
      location.organizationId,
      "tasks",
      location.id
    ).withConverter(ChecklistGroup.firestoreConverter)
  );

  const addBlock = async () => {
    try {
      if (tasks) {
        await tasks.addChecklist(nanoid());
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
              },
            },
            locationId: location.id,
          }
        );
      }
    } catch (error) {
      recordError(error);
    } finally {
      if (scrollBottomTarget.current) {
        scrollBottomTarget.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }
  };

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (errorTasks) {
    return <ErrorPage error={errorTasks} />;
  }

  if (loading || loadingTasks) {
    return <LoadingPage />;
  }

  return (
    <Layout>
      <GrayPageHeader
        title={capitalize(dayjs().format("dddd, MMMM D YYYY"))}
        extra={
          locationAccessKey.role <= RoleAccessLevels.MANAGER && (
            <Space>
              <Button icon={<PlusCircleOutlined />} onClick={addBlock}>
                {t("New Task List")}
              </Button>
              <Button
                icon={<ClockCircleOutlined />}
                onClick={() => managePeriodicTaskRef.current?.openNew()}
              >
                {t("Create Periodic Task")}
              </Button>
            </Space>
          )
        }
      />
      <Tabs
        defaultActiveKey="1"
        className="tasks-tabs-scrollable"
        items={[
          {
            label: t("Today"),
            key: "",
          },
          {
            label: t("Periodic Tasks"),
            key: "p-tasks",
          },
        ]}
        onChange={(key) => {
          navigate(key, { replace: true });
        }}
      />
      <Routes>
        <Route
          path="/"
          element={
            <TasksMain
              tasksDocument={tasks}
              recurringTaskDoc={recurringTaskDoc}
              createTask={addBlock}
              bottomElement={
                <div ref={scrollBottomTarget} css={{ height: 50 }} />
              }
            />
          }
        />
        <Route
          path="p-tasks"
          element={
            <PeriodicTasksList
              recurringTaskDoc={recurringTaskDoc}
              onEditTask={(task) =>
                managePeriodicTaskRef.current?.openEdit(task)
              }
              createTask={() => managePeriodicTaskRef.current?.openNew()}
            />
          }
        />
      </Routes>

      <ManagePeriodicTask
        ref={managePeriodicTaskRef}
        recurringTaskDoc={recurringTaskDoc}
      />
    </Layout>
  );
};
