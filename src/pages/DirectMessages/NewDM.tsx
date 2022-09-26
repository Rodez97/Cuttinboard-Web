/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useDMs,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Avatar, Button, List, Spin, Typography } from "antd";
import { GrayPageHeader } from "components/PageHeaders";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";

function NewDM() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { startNewLocationDM } = useDMs();
  const { getEmployees, getOrgEmployees } = useEmployeesList();
  const [creating, setCreating] = useState(false);

  const startNewChat = async (selectedUser: Employee) => {
    setCreating(true);
    try {
      const newId = await startNewLocationDM(selectedUser);
      navigate(pathname.replace("new", newId));
    } catch (error) {
      recordError(error);
    }
    setCreating(false);
  };
  return (
    <Spin spinning={creating}>
      <GrayPageHeader title={t("Start a Chat")} onBack={() => navigate(-1)} />
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{ minWidth: 270, maxWidth: 500, margin: "auto", width: "100%" }}
        >
          <Typography.Text type="secondary" css={{ fontSize: 18 }}>
            {t("With someone in your organization")}
          </Typography.Text>
          <List
            css={{ marginTop: 10 }}
            dataSource={getOrgEmployees.filter(
              ({ id }) => id !== Auth.currentUser.uid
            )}
            renderItem={(emp) => (
              <List.Item
                key={emp.id}
                extra={
                  <Button
                    type="link"
                    icon={<ArrowRightOutlined />}
                    onClick={() => startNewChat(emp)}
                  />
                }
                css={{ backgroundColor: "#F7F7F7", padding: 10 }}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} src={emp.avatar} />}
                  title={`${emp.name} ${emp.lastName}`}
                  description={emp.email}
                />
              </List.Item>
            )}
          />
          <Typography.Text type="secondary" css={{ fontSize: 18 }}>
            {t("With someone in this location")}
          </Typography.Text>
          <List
            css={{ marginTop: 10 }}
            dataSource={getEmployees.filter(
              ({ id }) => id !== Auth.currentUser.uid
            )}
            renderItem={(emp) => (
              <List.Item
                key={emp.id}
                extra={
                  <Button
                    type="link"
                    icon={<ArrowRightOutlined />}
                    onClick={() => startNewChat(emp)}
                  />
                }
                css={{ backgroundColor: "#F7F7F7", padding: 10 }}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} src={emp.avatar} />}
                  title={`${emp.name} ${emp.lastName}`}
                  description={emp.email}
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    </Spin>
  );
}

export default NewDM;
