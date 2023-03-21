import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "@cuttinboard-solutions/cuttinboard-library";

const store = configureStore({
  reducer: appReducer,
});

export default store;
