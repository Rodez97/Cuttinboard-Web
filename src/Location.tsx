import React, { lazy, Suspense } from "react";
import { LoadingPage, PageError } from "./shared";
import {
  useCuttinboard,
  useCuttinboardLocationRaw,
} from "@rodez97/cuttinboard-library";

const RootLoading = lazy(() => import("./shared/molecules/RootLoading"));
const LocationContainer = lazy(() => import("./LocationContainer"));

function Location() {
  const { loading: loadingCuttinboard, error: errorCuttinboard } =
    useCuttinboard();
  const { loading, location, error } = useCuttinboardLocationRaw();

  if (loadingCuttinboard || loading) {
    return <RootLoading />;
  }

  if (errorCuttinboard) {
    return <PageError error={errorCuttinboard} />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  if (!location) {
    const error = new Error("No location found");
    return <PageError error={error} />;
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <LocationContainer />
    </Suspense>
  );
}

export default Location;
