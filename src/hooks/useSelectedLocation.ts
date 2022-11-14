import useLocalStorage from "@rehooks/local-storage";
import { recordError } from "../utils/utils";

export function useSelectedLocation() {
  const [selectedLocation, setSelectedLocation, deleteSelectedLocation] =
    useLocalStorage("selectedLocation", null);

  const selectLocation = (locationId: string | null) => {
    try {
      if (locationId) {
        setSelectedLocation(locationId);
      } else {
        deleteSelectedLocation();
      }
    } catch (error) {
      recordError(error);
    }
  };

  return { selectedLocation, selectLocation };
}
