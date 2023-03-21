import useLocalStorage from "@rehooks/local-storage";

const useSignUpLocalTracker = () =>
  useLocalStorage<string | undefined>("cuttinboard:new-user");

export default useSignUpLocalTracker;
