import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ClearOutlined,
  PlusCircleOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  LocationCheckList,
  ModuleFirestoreConverter,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Col, Input, Layout, Row, Space, Typography } from "antd";
import dayjs from "dayjs";
import { getAnalytics, logEvent } from "firebase/analytics";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  limitToLast,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { nanoid } from "nanoid";
import React, { useMemo, useState } from "react";
import { useDocument } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageError from "../../components/PageError";
import { GrayPageHeader } from "../../components/PageHeaders";
import PageLoading from "../../components/PageLoading";
import SimpleTodo from "../../components/SimpleTodo";
import { recordError } from "../../utils/utils";

const LocationCheckListConverter =
  ModuleFirestoreConverter<LocationCheckList>();

function GlobalChecklist() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { location, locationAccessKey } = useLocation();
  const [newTaskName, setNewTaskName] = useState("");
  const [checklistData, loading, error] = useDocument<LocationCheckList>(
    doc(
      Firestore,
      "Locations",
      location.id,
      "locationChecklist",
      selectedDate.format("DD_MM_YYYY")
    ).withConverter(LocationCheckListConverter)
  );

  const canUse = useMemo(
    () => locationAccessKey.role <= RoleAccessLevels.MANAGER,
    [locationAccessKey]
  );

  const handleTaskChange = async (key: string, status: boolean) => {
    if (!checklistData.exists() || !checklistData.data()?.tasks[key]) {
      return;
    }
    const docRef = doc(
      Firestore,
      "Locations",
      location.id,
      "locationChecklist",
      selectedDate.format("DD_MM_YYYY")
    );
    try {
      await setDoc(
        docRef,
        { tasks: { [key]: { ...checklistData.data().tasks[key], status } } },
        { merge: true }
      );
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName || !canUse) {
      return;
    }
    const docRef = doc(
      Firestore,
      "Locations",
      location.id,
      "locationChecklist",
      selectedDate.format("DD_MM_YYYY")
    );
    const task = {
      [nanoid()]: {
        name: newTaskName,
        status: false,
        createdAt: Timestamp.now(),
      },
    };
    setNewTaskName("");
    try {
      const update: Partial<LocationCheckList> = {
        tasks: task,
      };
      if (!checklistData.exists()) {
        update.checklistDate = Timestamp.fromDate(selectedDate.toDate());
        update.createdAt = Timestamp.now();
        update.createdBy = Auth.currentUser.uid;
      }
      await setDoc(docRef, update, { merge: true });
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    if (!checklistData || !canUse) {
      return;
    }
    const docRef = doc(
      Firestore,
      "Locations",
      location.id,
      "locationChecklist",
      selectedDate.format("DD_MM_YYYY")
    );
    const tasks = checklistData.get("tasks");
    try {
      if (
        Object.keys(tasks ?? {}).length === 1 &&
        Object.keys(tasks)[0] === taskId
      ) {
        await deleteDoc(docRef);
      } else {
        await setDoc(
          docRef,
          {
            tasks: {
              [taskId]: deleteField(),
            },
          },
          { merge: true }
        );
      }
    } catch (error) {
      recordError(error);
    }
  };

  const cloneLastChecklist = async () => {
    const docRef = doc(
      Firestore,
      "Locations",
      location.id,
      "locationChecklist",
      selectedDate.format("DD_MM_YYYY")
    );
    const collRef = query(
      collection(Firestore, "Locations", location.id, "locationChecklist"),
      orderBy("checklistDate"),
      limitToLast(1)
    );
    try {
      const docsSnap = await getDocs(collRef);
      if (docsSnap.docs.length === 0) {
        return;
      }
      const update: Partial<LocationCheckList> = {
        tasks: docsSnap.docs[0].get("tasks"),
      };
      if (!checklistData.exists()) {
        update.checklistDate = Timestamp.fromDate(selectedDate.toDate());
        update.createdAt = Timestamp.now();
        update.createdBy = Auth.currentUser.uid;
      }
      await setDoc(docRef, update, { merge: true });
    } catch (error) {
      recordError(error);
    }
  };

  const clearAll = async () => {
    if (!checklistData.data()) {
      return;
    }
    const docRef = doc(
      Firestore,
      "Locations",
      location.id,
      "locationChecklist",
      selectedDate.format("DD_MM_YYYY")
    );
    const tasks = Object.keys(checklistData.data()?.tasks ?? {});
    if (tasks.length === 0) {
      return;
    }
    const update: Partial<LocationCheckList> = {
      tasks: {},
    };

    for (const task of tasks) {
      update.tasks[task] = {
        ...checklistData.data().tasks[task],
        status: false,
      };
    }
    try {
      await setDoc(docRef, update, { merge: true });
    } catch (error) {
      recordError(error);
    }
  };

  if (error) {
    return <PageError error={error} />;
  }
  return (
    <Layout.Content>
      <GrayPageHeader
        className="site-page-header-responsive"
        onBack={() => navigate(-1)}
        title={t("Daily Checklists")}
        subTitle={`(${Number(
          Object.keys(checklistData?.data()?.tasks ?? {})?.length
        )})`}
      />

      {loading ? (
        <PageLoading />
      ) : (
        <Row justify="center" style={{ paddingBottom: "50px" }}>
          <Col
            xs={24}
            md={20}
            lg={16}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              paddingTop: "10px",
            }}
          >
            <Space style={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={() => setSelectedDate((sd) => sd.subtract(1, "day"))}
                icon={<ArrowLeftOutlined />}
                type="link"
                shape="circle"
              />
              <Typography.Text type="secondary">
                {selectedDate.format("dddd, MM/DD/YY")}
              </Typography.Text>
              <Button
                onClick={() => setSelectedDate((sd) => sd.add(1, "day"))}
                icon={<ArrowRightOutlined />}
                type="link"
                shape="circle"
              />
            </Space>
            {canUse && (
              <Space
                align="center"
                size="large"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Button
                  onClick={cloneLastChecklist}
                  icon={<RetweetOutlined />}
                  disabled={checklistData.exists()}
                  type="dashed"
                >
                  {t("Clone Last")}
                </Button>
                <Button onClick={clearAll} icon={<ClearOutlined />} danger>
                  {t("Clear All")}
                </Button>
              </Space>
            )}
            <Space direction="vertical" style={{ display: "flex" }}>
              {canUse && (
                <Input
                  placeholder={t("Add a task")}
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.code === "Enter") {
                      e.preventDefault();
                      handleAddTask();
                    }
                  }}
                  addonAfter={<PlusCircleOutlined onClick={handleAddTask} />}
                />
              )}
              <SimpleTodo
                tasks={checklistData?.data()?.tasks ?? {}}
                canRemove={canUse}
                onRemove={handleRemoveTask}
                onChange={handleTaskChange}
              />
            </Space>
          </Col>
        </Row>
      )}
    </Layout.Content>
  );
}

export default GlobalChecklist;
