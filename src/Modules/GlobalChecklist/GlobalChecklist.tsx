/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ClearOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Firestore } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  Checklist_Section,
  LocationCheckList,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Divider, Layout, Space, Typography } from "antd";
import { doc } from "firebase/firestore";
import { useMemo, useRef } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { GrayPageHeader, PageError, PageLoading } from "../../components";
import TasksSection from "./TasksSection";
import ManageSectionDialog, {
  ManageSectionDialogRef,
} from "./ManageSectionDialog";
import { orderBy } from "lodash";

function GlobalChecklist() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const manageSectionRef = useRef<ManageSectionDialogRef>(null);
  const { location, locationAccessKey } = useLocation();
  const [checklistData, loading, error] = useDocumentData<LocationCheckList>(
    doc(
      Firestore,
      "Organizations",
      location.organizationId,
      "locationChecklist",
      location.id
    ).withConverter(LocationCheckList.Converter)
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
    const total = checklistData.checklistSummary.total;
    const completed = checklistData.checklistSummary.completed;
    return `${completed}/${total} ${t("tasks completed")}`;
  }, [checklistData]);

  if (error) {
    return <PageError error={error} />;
  }

  const sectionsOrderedByTagAndCreationDate = useMemo(() => {
    if (!checklistData) {
      return [];
    }

    if (!checklistData.sections) {
      return [];
    }

    // Order sections by creation date
    const sections = orderBy(
      Object.entries(checklistData.sections),
      ([_, section]) => section.createdAt?.toMillis(),
      "desc"
    );

    // Group sections by tag
    const sectionsByTag = new Map<string, [string, Checklist_Section][]>();
    sections.forEach(([id, section]) => {
      const tag = section.tag || "General";
      if (!sectionsByTag.has(tag)) {
        sectionsByTag.set(tag, []);
      }
      sectionsByTag.get(tag).push([id, section]);
    });
    // Order sections by creation date
    sectionsByTag.forEach((sections) => {
      sections.sort(
        ([_, section1], [__, section2]) =>
          section1.createdAt?.toMillis() - section2.createdAt?.toMillis()
      );
    });

    return Array.from(sectionsByTag.entries()).sort((a, b) => {
      // Sort by the creation date of the first section in each tag
      const aDate = a[1][0][1].createdAt?.toMillis();
      const bDate = b[1][0][1].createdAt?.toMillis();
      if (aDate && bDate) {
        return aDate - bDate;
      }
      return 0;
    });
  }, [checklistData]);

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        onBack={() =>
          navigate(`/location/${location.id}/apps`, { replace: true })
        }
        title={t("Daily Checklists")}
        subTitle={getSummaryText}
        extra={
          canUse && (
            <Space>
              <Button
                onClick={() => manageSectionRef.current?.openNew()}
                icon={<PlusCircleOutlined />}
                type="primary"
              >
                {t("Add Section")}
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
              {sectionsOrderedByTagAndCreationDate.map(([tag, sections]) => (
                <Space direction="vertical" css={{ display: "flex" }} key={tag}>
                  <Divider orientation="left">
                    <Typography.Title level={3}>{tag}</Typography.Title>
                  </Divider>
                  {sections.map(([sectionKey, section]) => (
                    <TasksSection
                      key={sectionKey}
                      section={section}
                      sectionId={sectionKey}
                      canManage={canUse}
                      onEdit={() =>
                        manageSectionRef.current?.openEdit(sectionKey)
                      }
                      rootChecklist={checklistData}
                    />
                  ))}
                </Space>
              ))}
            </div>
          </div>
        )}
      </Layout.Content>

      <ManageSectionDialog
        rootChecklist={checklistData}
        ref={manageSectionRef}
      />
    </Layout.Content>
  );
}

export default GlobalChecklist;
