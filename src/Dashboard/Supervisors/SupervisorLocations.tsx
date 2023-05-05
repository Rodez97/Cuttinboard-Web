/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Alert, Button, Layout, message, Modal, Table } from "antd";
import React from "react";
import { GrayPageHeader, UserInfoElement } from "../../shared";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import { deleteDoc, doc } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { recordError } from "../../utils/utils";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library";
import { ANALYTICS } from "firebase";
import {
  ILocation,
  IOrganizationEmployee,
} from "@cuttinboard-solutions/types-helpers";

type props = {
  locations: ILocation[];
  onUnassign: (location: ILocation) => void;
  supervisor: IOrganizationEmployee;
};

export default ({ locations, onUnassign, supervisor }: props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    Modal.info({
      title: t("User Info"),
      content: <UserInfoElement employee={supervisor} />,
    });
  };

  const deleteSupervisor = () => {
    Modal.confirm({
      title: t("Do you want to remove this supervisor?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          navigate(-1);
          await deleteDoc(doc(FIRESTORE, supervisor.refPath));
          message.success(t("Supervisor deleted"));
          // Report to analytics
          logEvent(ANALYTICS, "delete_supervisor");
        } catch (error) {
          recordError(error);
          message.error(t("Failed to delete supervisor"));
        }
      },
    });
  };

  return (
    <React.Fragment>
      <GrayPageHeader
        onBack={() => navigate(-1)}
        avatar={{
          src: supervisor.avatar
            ? supervisor.avatar
            : `https://api.dicebear.com/5.x/shapes/svg?seed=${supervisor.id}&background=%23ffffff&radius=50`,
          onClick: handleAvatarClick,
          style: { cursor: "pointer" },
        }}
        title={`${supervisor.name} ${supervisor.lastName}`}
        subTitle={
          <Alert
            message={t("Supervising {{0}} location(s)", {
              0: supervisor.supervisingLocations?.length ?? 0,
            })}
            type="warning"
            showIcon
          />
        }
        extra={[
          <Button
            key="assign"
            icon={<PlusSquareOutlined />}
            onClick={() => navigate("assign")}
          >
            {t("Assign Locations")}
          </Button>,
          <Button
            key="delete"
            icon={<DeleteOutlined />}
            onClick={deleteSupervisor}
            danger
          >
            {t("Delete Supervisor")}
          </Button>,
        ]}
      />
      <Layout.Content>
        <Table<ILocation>
          css={{ width: "100%", padding: 15 }}
          columns={[
            {
              title: t("Name"),
              dataIndex: "name",
              key: "name",
              filterMode: "menu",
              filterSearch: true,
              onFilter: (value: string, record) =>
                record.name.toLowerCase().includes(value.toLowerCase()),
              sorter: (a, b) => a.name.localeCompare(b.name),
              defaultSortOrder: "ascend",
            },
            {
              title: t("State"),
              dataIndex: ["address", "state"],
              key: "state",
              sorter: (a, b) => {
                const aState = a.address?.state ?? "";
                const bState = b.address?.state ?? "";
                return aState.localeCompare(bState);
              },
            },
            {
              title: t("City"),
              dataIndex: ["address", "city"],
              key: "city",
              sorter: (a, b) => {
                const aCity = a.address?.city ?? "";
                const bCity = b.address?.city ?? "";
                return aCity.localeCompare(bCity);
              },
            },
            {
              title: "ID",
              dataIndex: "intId",
              key: "id",
              sorter: (a, b) => {
                const aId = a.intId ?? "";
                const bId = b.intId ?? "";
                return aId.localeCompare(bId);
              },
            },
            {
              title: "",
              key: "action",
              render: (_, record) => (
                <a onClick={() => onUnassign(record)}>{t("Unassign")}</a>
              ),
              width: 100,
              align: "center",
            },
          ]}
          dataSource={locations}
          size="small"
          pagination={false}
        />
      </Layout.Content>
    </React.Fragment>
  );
};
