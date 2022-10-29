/** @jsx jsx */
import { jsx } from "@emotion/react";
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
  FirebaseSignature,
  ILocationCheckList,
  LocationCheckList,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Col, Input, Layout, Row, Space, Typography } from "antd";
import dayjs from "dayjs";
import {
  collection,
  doc,
  getDocs,
  limitToLast,
  orderBy,
  PartialWithFieldValue,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { nanoid } from "nanoid";
import { useMemo, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageError from "../../components/PageError";
import { GrayPageHeader } from "../../components/PageHeaders";
import PageLoading from "../../components/PageLoading";
import SimpleTodo from "../../components/SimpleTodo";
import { recordError } from "../../utils/utils";

function GlobalChecklist() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { location, locationAccessKey } = useLocation();
  const [newTaskName, setNewTaskName] = useState("");
  const [checklistData, loading, error] = useDocumentData<LocationCheckList>(
    doc(
      Firestore,
      "Organizations",
      location.organizationId,
      "locationChecklist",
      `${selectedDate.format("DDMMYYYY")}_${location.id}`
    ).withConverter(LocationCheckList.Converter)
  );

  const canUse = useMemo(
    () => locationAccessKey.role <= RoleAccessLevels.MANAGER,
    [locationAccessKey]
  );

  const handleTaskChange = async (key: string, status: boolean) => {
    if (!checklistData) {
      return;
    }
    try {
      await checklistData.changeTaskStatus(key, status);
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName || !canUse) {
      return;
    }
    const task = {
      name: newTaskName,
      status: false,
      createdAt: serverTimestamp(),
    };
    setNewTaskName("");
    try {
      if (checklistData) {
        await checklistData.addTask(nanoid(), task);
      } else {
        await setDoc(
          doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "locationChecklist",
            `${selectedDate.format("DDMMYYYY")}_${location.id}`
          ),
          {
            createdAt: serverTimestamp(),
            createdBy: Auth.currentUser.uid,
            checklistDate: Timestamp.fromDate(selectedDate.toDate()),
            signedBy: Auth.currentUser.uid,
            tasks: { [nanoid()]: task },
            locationId: location.id,
          }
        );
      }
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    if (!checklistData || !canUse) {
      return;
    }
    try {
      await checklistData.removeTask(taskId);
    } catch (error) {
      recordError(error);
    }
  };

  const cloneLastChecklist = async () => {
    if (!canUse) {
      return;
    }
    const docRef = doc(
      Firestore,
      "Organizations",
      location.organizationId,
      "locationChecklist",
      `${selectedDate.format("DDMMYYYY")}_${location.id}`
    );
    const collRef = query(
      collection(
        Firestore,
        "Organizations",
        location.organizationId,
        "locationChecklist"
      ),
      where("locationId", "==", location.id),
      orderBy("checklistDate"),
      limitToLast(1)
    ).withConverter(LocationCheckList.Converter);
    try {
      const docsSnap = await getDocs(collRef);
      if (docsSnap.docs.length === 0) {
        return;
      }
      const lastChecklist = docsSnap.docs[0].data();
      const update: PartialWithFieldValue<
        ILocationCheckList & FirebaseSignature
      > = {
        tasks: lastChecklist.tasks,
      };
      if (!checklistData) {
        update.checklistDate = Timestamp.fromDate(selectedDate.toDate());
        update.createdAt = serverTimestamp();
        update.createdBy = Auth.currentUser.uid;
        update.signedBy = Auth.currentUser.uid;
        update.locationId = location.id;
      }
      await setDoc(docRef, update, { merge: true });
    } catch (error) {
      recordError(error);
    }
  };

  const clearAll = async () => {
    if (!checklistData || !canUse) {
      return;
    }
    try {
      await checklistData.clearTasks();
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
        onBack={() => navigate(-1)}
        title={t("Daily Checklists")}
        subTitle={`(${checklistData?.tasksSummary?.total ?? 0})`}
      />

      {loading ? (
        <PageLoading />
      ) : (
        <Row justify="center" css={{ paddingBottom: "50px" }}>
          <Col
            xs={24}
            md={20}
            lg={16}
            css={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              paddingTop: "10px",
            }}
          >
            <Space css={{ display: "flex", justifyContent: "center" }}>
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
                css={{ display: "flex", justifyContent: "center" }}
              >
                <Button
                  onClick={cloneLastChecklist}
                  icon={<RetweetOutlined />}
                  disabled={checklistData != null}
                  type="dashed"
                >
                  {t("Clone Last")}
                </Button>
                <Button onClick={clearAll} icon={<ClearOutlined />} danger>
                  {t("Clear All")}
                </Button>
              </Space>
            )}
            <Space direction="vertical" css={{ display: "flex" }}>
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
                tasks={checklistData?.tasks ?? {}}
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
