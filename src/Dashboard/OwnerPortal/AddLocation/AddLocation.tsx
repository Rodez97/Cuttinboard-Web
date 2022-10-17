/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FinalStep from "./Steps/FinalStep";
import LocationInfo from "./Steps/LocationInfo";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Functions } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { Button, Layout, message, Result, Space, Steps, Tooltip } from "antd";
import { recordError } from "../../../utils/utils";
import { useHttpsCallable } from "react-firebase-hooks/functions";

interface AddLocationContextProps {
  location: Partial<Location>;
  setLocation: React.Dispatch<React.SetStateAction<Partial<Location>>>;
  generalManager?: {
    email: string;
    name: string;
    lastName: string;
  };
  setGeneralManager: React.Dispatch<
    React.SetStateAction<{
      email: string;
      name: string;
      lastName: string;
    }>
  >;
}

const AddLocationContext = createContext<AddLocationContextProps>(
  {} as AddLocationContextProps
);

const steps = [
  {
    title: "Location details",
    content: <LocationInfo />,
  },
  {
    title: "Add Location",
    content: <FinalStep />,
  },
];

function AddLocation() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const [location, setLocation] = useState<Partial<Location>>(null);
  const [generalManager, setGeneralManager] = useState<{
    email: string;
    name: string;
    lastName: string;
  }>(null);
  const [addLocation, creating, error] = useHttpsCallable(
    Functions,
    "http-locations-create"
  );

  const handleNext = () => {
    if (activeStep === 0 && location) {
      setActiveStep(activeStep + 1);
    }
    if (activeStep === 1 && location) {
      createLocation();
    }
  };

  const getNextButtonDisabled = useMemo(() => {
    if (activeStep <= 1 && location) {
      return false;
    }
    return true;
  }, [activeStep, location]);

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(-1);
      return;
    }
    setActiveStep(activeStep - 1);
  };

  const createLocation = async () => {
    try {
      const hide = message.loading(t("Adding a new location..."), 0);
      await addLocation({
        location,
        generalManager,
      });
      hide();
      navigate(-1);
    } catch (error) {
      recordError(error);
    }
  };

  if (error) {
    return (
      <Result
        status="error"
        title={t(error.message)}
        extra={
          <Button type="primary" key="console" onClick={() => navigate(-1)}>
            {t("Go back")}
          </Button>
        }
      />
    );
  }

  return (
    <AddLocationContext.Provider
      value={{
        location,
        setLocation,
        generalManager,
        setGeneralManager,
      }}
    >
      <Layout css={{ overflow: "auto", height: "100%", padding: 20 }}>
        <Steps current={activeStep}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Layout.Content
          css={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingBottom: 30,
            overflow: "auto",
          }}
        >
          {steps[activeStep].content}
        </Layout.Content>

        <Layout.Footer>
          <Space css={{ justifyContent: "center", display: "flex" }}>
            <Button
              disabled={activeStep < 0 || creating}
              onClick={handleBack}
              type="dashed"
            >
              {t("Back")}
            </Button>
            <Tooltip
              title={activeStep === 0 ? t("Save changes to continue") : ""}
              placement="right"
            >
              <div>
                <Button
                  type="primary"
                  onClick={handleNext}
                  disabled={getNextButtonDisabled || creating}
                >
                  {activeStep === steps.length - 1
                    ? t("Create Location")
                    : t("Next")}
                </Button>
              </div>
            </Tooltip>
          </Space>
        </Layout.Footer>
      </Layout>
    </AddLocationContext.Provider>
  );
}

export const useAddLocation = () => useContext(AddLocationContext);

export default AddLocation;
