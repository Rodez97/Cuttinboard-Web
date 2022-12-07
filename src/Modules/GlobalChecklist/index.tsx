/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ClearOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  FIRESTORE,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Empty, Layout, Space } from "antd";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useMemo } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { GrayPageHeader, PageError, PageLoading } from "../../components";
import TaskBlock from "../Tasks/TaskBlock";
import { nanoid } from "nanoid";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { ChecklistGroup } from "@cuttinboard-solutions/cuttinboard-library/checklist";

export default () => {
  const { user } = useCuttinboard();
  const { t } = useTranslation();
  const { location, locationAccessKey } = useCuttinboardLocation();
  const [checklistData, loading, error] = useDocumentData<ChecklistGroup>(
    doc(
      FIRESTORE,
      "Organizations",
      location.organizationId,
      "locationChecklist",
      location.id
    ).withConverter(ChecklistGroup.firestoreConverter)
  );

  const canUse = useMemo(
    () => locationAccessKey.role <= RoleAccessLevels.MANAGER,
    [locationAccessKey]
  );

  const reset = async () => {
    if (!checklistData || !canUse) {
      return;
    }
    try {
      await checklistData.resetAllTasks();
    } catch (error) {
      recordError(error);
    }
  };

  const getSummaryText = useMemo(() => {
    if (!checklistData) {
      return "0/0 tasks completed";
    }
    const total = checklistData.summary.total;
    const completed = checklistData.summary.completed;
    return `${completed}/${total} ${t("tasks completed")}`;
  }, [checklistData, t]);

  if (error) {
    return <PageError error={error} />;
  }

  const sectionsOrderedByTagAndCreationDate = useMemo(() => {
    if (!checklistData) {
      return [];
    }

    if (checklistData.checklistsArray.length === 0) {
      return [];
    }

    return checklistData.checklistsArray;
  }, [checklistData]);

  const addBlock = async () => {
    try {
      if (checklistData) {
        await checklistData.addChecklist(nanoid());
      } else {
        // If we don't have a checklist, we're creating a new one
        await setDoc(
          doc(
            FIRESTORE,
            "Organizations",
            location.organizationId,
            "locationChecklist",
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
    }
  };

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        title={t("Daily Checklists")}
        subTitle={getSummaryText}
        extra={
          canUse && (
            <Space>
              <Button
                onClick={addBlock}
                icon={<PlusCircleOutlined />}
                type="primary"
              >
                {t("New Task List")}
              </Button>
              <Button onClick={reset} icon={<ClearOutlined />} danger>
                {t("Clear All")}
              </Button>
            </Space>
          )
        }
      />

      <Layout.Content
        css={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        {error ? (
          <PageError error={error} />
        ) : loading ? (
          <PageLoading />
        ) : (
          <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
            <div
              css={{
                minWidth: 300,
                maxWidth: 900,
                margin: "auto",
                width: "100%",
              }}
            >
              <Space direction="vertical" css={{ display: "flex" }}>
                {sectionsOrderedByTagAndCreationDate.length > 0 &&
                checklistData ? (
                  sectionsOrderedByTagAndCreationDate.map((checklist) => (
                    <TaskBlock
                      key={checklist.id}
                      section={checklist}
                      sectionId={checklist.id}
                      canManage={canUse}
                      rootChecklist={checklistData}
                    />
                  ))
                ) : (
                  <Empty
                    description={
                      <span>
                        {t("No tasks found")}.{" "}
                        <a onClick={addBlock}>Create one</a> or{" "}
                        <a
                          href="https://www.cuttinboard.com/help/tasks-app"
                          target="_blank"
                          rel="noreferrer"
                        >
                          learn more.
                        </a>
                      </span>
                    }
                  />
                )}
              </Space>
            </div>
          </div>
        )}
      </Layout.Content>
    </Layout.Content>
  );
};
