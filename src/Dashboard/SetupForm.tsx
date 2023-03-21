import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button, message, Skeleton } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function SetupForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmSetup({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: location.href,
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      onClose();
      message.success(t("Payment method saved successfully!"));
    }

    setIsProcessing(false);
  };

  return (
    <Skeleton loading={!stripe}>
      <form onSubmit={handleSubmit}>
        <PaymentElement onReady={() => setIsReady(true)} />
        <Button
          disabled={!stripe || !isReady}
          block
          type="primary"
          htmlType="submit"
          style={{
            marginTop: 10,
          }}
          loading={isProcessing}
        >
          {t("Setup Payment Method")}
        </Button>

        <Button
          disabled={!stripe || !isReady || isProcessing}
          block
          type="dashed"
          danger
          style={{
            marginTop: 10,
          }}
          onClick={onClose}
        >
          {t("Cancel")}
        </Button>
        {/* Show error message to your customers */}
        {errorMessage && <div>{errorMessage}</div>}
      </form>
    </Skeleton>
  );
}

export default SetupForm;
