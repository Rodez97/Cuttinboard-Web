/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Drawer, Layout } from "antd/es";
import { useState } from "react";
import React from "react";
import { useMediaQuery } from "@react-hook/media-query";
import Icon from "@ant-design/icons";
import mdiMenu from "@mdi/svg/svg/menu.svg";
import { PageHeader } from "@ant-design/pro-layout";

interface DrawerSiderContextProps {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DrawerSiderContext = React.createContext<DrawerSiderContextProps>(
  {} as DrawerSiderContextProps
);

export const useDrawerSiderContext = () => {
  const context = React.useContext(DrawerSiderContext);
  if (context === undefined) {
    throw new Error(
      "useDrawerSiderContext must be used within a DrawerSiderContext"
    );
  }
  return context;
};

export const useDrawerSider = () => {
  const matches = useMediaQuery("only screen and (max-width: 992px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const DrawerHeaderControl = ({ title }: { title: string }) => {
    return matches ? (
      <PageHeader
        css={{ backgroundColor: "#dfdfdf" }}
        title={
          <Button
            icon={<Icon component={mdiMenu} />}
            type={"text"}
            shape="circle"
            onClick={() => setDrawerOpen(true)}
            size="large"
          />
        }
        subTitle={title}
      />
    ) : null;
  };

  const DrawerSider = ({ children }: { children: React.ReactNode }) => {
    return (
      <DrawerSiderContext.Provider
        value={{
          drawerOpen,
          setDrawerOpen,
        }}
      >
        {matches ? (
          <Drawer
            placement="left"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            css={{ backgroundColor: "#121432 !important" }}
            contentWrapperStyle={{
              overflow: "auto !important",
            }}
            width={280}
            bodyStyle={{ padding: 0, overflow: "auto !important" }}
            headerStyle={{
              display: "none",
            }}
          >
            {children}
          </Drawer>
        ) : (
          <Layout.Sider width={250} className="module-sider">
            {children}
          </Layout.Sider>
        )}
      </DrawerSiderContext.Provider>
    );
  };

  return { DrawerSider, DrawerHeaderControl };
};
