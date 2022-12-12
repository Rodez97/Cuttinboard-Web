/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Location } from "@cuttinboard-solutions/cuttinboard-library";
import { Alert, Button, Layout, Modal, Table } from "antd";
import React from "react";
import { GrayPageHeader, UserInfoElement } from "../../shared";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusSquareOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { deleteDoc } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { recordError } from "../../utils/utils";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";

type props = {
  locations: Location[];
  onUnassign: (location: Location) => void;
  supervisor: Employee;
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
      title: "Do you want to remove this supervisor?",
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          navigate(-1);
          await deleteDoc(supervisor.docRef);
          // Report to analytics
          logEvent(getAnalytics(), "delete_supervisor");
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  return (
    <React.Fragment>
      <GrayPageHeader
        onBack={() => navigate(-1)}
        avatar={{
          src: supervisor.avatar,
          onClick: handleAvatarClick,
          style: { cursor: "pointer" },
          icon: <UserOutlined />,
        }}
        title={supervisor.fullName}
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
        <Table<Location>
          css={{ width: "100%", padding: 15 }}
          columns={[
            {
              title: "Name",
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
              title: "State",
              dataIndex: ["address", "state"],
              key: "state",
              sorter: (a, b) => {
                const aState = a.address?.state ?? "";
                const bState = b.address?.state ?? "";
                return aState.localeCompare(bState);
              },
            },
            {
              title: "City",
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
                <a onClick={() => onUnassign(record)}>Unassign</a>
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
