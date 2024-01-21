/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd/es";
import DMList from "./DMList";
import dmImage from "../../assets/images/encrypted-data.png";
import { useTranslation } from "react-i18next";
import { EmptyBoard, NotFound } from "../../shared";
import usePageTitle from "../../hooks/usePageTitle";
import {
  DirectMessagesProvider,
  useDirectMessageChat,
} from "@rodez97/cuttinboard-library";
import ActiveDM from "./ActiveDM";
import { Route, Routes, useParams } from "react-router-dom";
import { useEffect } from "react";
import EmptyExtended from "./../../shared/molecules/EmptyExtended";
import { IEmployee } from "@rodez97/types-helpers";
import { useDrawerSider } from "../../shared/organisms/useDrawerSider";

export default ({ employees }: { employees?: IEmployee[] }) => {
  usePageTitle("Direct Messages");
  const { t } = useTranslation();
  const { DrawerSider, DrawerHeaderControl } = useDrawerSider();

  return (
    <DirectMessagesProvider>
      <DrawerHeaderControl title={t("Direct Messages")} />
      <Layout hasSider>
        <DrawerSider>
          <DMList employees={employees} />
        </DrawerSider>
        {/* <Layout.Sider
          width={250}
          breakpoint="lg"
          collapsedWidth="0"
          className="module-sider"
        >
          <DMList employees={employees} />
        </Layout.Sider> */}
        <Layout.Content css={{ display: "flex", flexDirection: "column" }}>
          <Routes>
            <Route path=":dmId" element={<Main />} />
            <Route
              index
              element={
                <EmptyExtended
                  description={
                    <p>
                      {t("Welcome to Direct Messages")}
                      {". "}
                      <a
                        href="http://www.cuttinboard.com/help/direct-messages"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("Learn more")}
                      </a>
                    </p>
                  }
                  image={dmImage}
                  descriptions={[
                    "Chat with other Cuttinboard users",
                    "Have 1-on-1 conversations with your team",
                  ]}
                />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </DirectMessagesProvider>
  );
};

const Main = () => {
  const { t } = useTranslation();
  const { dmId } = useParams();
  const { selectedDirectMessage, selectDirectMessage } = useDirectMessageChat();

  useEffect(() => {
    if (dmId) {
      selectDirectMessage(dmId);
    }

    return () => {
      selectDirectMessage("");
    };
  }, [dmId, selectDirectMessage]);

  if (!selectedDirectMessage) {
    return (
      <EmptyBoard
        description={
          <p>
            {t("Welcome to Direct Messages")}
            {". "}
            <a
              href="http://www.cuttinboard.com/help/direct-messages"
              target="_blank"
              rel="noreferrer"
            >
              {t("Learn more")}
            </a>
          </p>
        }
        image={dmImage}
      />
    );
  }

  return <ActiveDM selectedDirectMessage={selectedDirectMessage} />;
};
