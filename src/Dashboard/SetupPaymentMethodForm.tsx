import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FUNCTIONS, useDisclose } from "@rodez97/cuttinboard-library";
import SetupForm from "./SetupForm";
import { Button, Modal, Result, Spin } from "antd/es";
import { useDashboard } from "./DashboardProvider";
import { httpsCallable } from "firebase/functions";
import { useTranslation } from "react-i18next";
import { logAnalyticsEvent } from "utils/analyticsHelpers";

const stripePromise = loadStripe(
  "pk_live_51KZnSWCYVoOESVglKcMEB4amoGeOkMeSkqgfcEVW7wQLGVmYL8YJFmx4nB70ZLa3pNvEoOzsz6Dl9qeuQkebAXJq00ZxWrYzFj"
);

export interface SetupPMDialogRef {
  openDialog: () => void;
}

const SetupPaymentMethodForm = forwardRef<SetupPMDialogRef, unknown>(
  (_, ref) => {
    const { t } = useTranslation();
    const { organization } = useDashboard();
    const [isOpen, open, close] = useDisclose(false);
    const [clientSecret, setClientSecret] = useState("");
    const [isProcessing, setIsProcessing] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    useImperativeHandle(ref, () => ({
      openDialog,
    }));

    const openDialog = () => {
      open();
      createManagePaymentIntent();
    };

    const createManagePaymentIntent = async () => {
      if (!organization) {
        throw new Error("No organization");
      }

      try {
        setIsProcessing(true);

        const createSetupIntent = httpsCallable<undefined, string>(
          FUNCTIONS,
          "stripe-createsetupintent"
        );
        const data = await createSetupIntent();

        if (!data) {
          throw new Error("No data returned from stripe-createsetupintent");
        }

        const setupIntent = data.data;

        setClientSecret(setupIntent);

        logAnalyticsEvent("manage_payment_methods", {
          from: "cuttinboard",
        });
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsProcessing(false);
      }
    };

    const closeDialog = () => {
      setClientSecret("");
      close();
    };

    if (isProcessing) {
      return (
        <Modal open={isOpen} closable={false} footer={null}>
          <Result
            status="info"
            title={t("Processing")}
            subTitle={t("Please wait while we process your request")}
            extra={<Spin size="large" tip={t("Processing...")} />}
          />
        </Modal>
      );
    }

    if (errorMessage) {
      return (
        <Modal open={isOpen} closable={false} footer={null}>
          <Result
            status="error"
            title="Error"
            subTitle={errorMessage}
            extra={
              <Button type="primary" onClick={closeDialog}>
                {t("Close")}
              </Button>
            }
          />
        </Modal>
      );
    }

    if (!clientSecret) {
      return null;
    }

    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: clientSecret,
        }}
      >
        <Modal open={isOpen} closable={false} footer={null}>
          <SetupForm onClose={closeDialog} />
        </Modal>
      </Elements>
    );
  }
);

export default SetupPaymentMethodForm;
