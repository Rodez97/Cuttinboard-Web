import {
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";

export const useNewElement = () => {
  const { pathname } = useRouterLocation();
  const navigate = useNavigate();

  const newElement = () => {
    if (pathname.endsWith("/new")) {
      return;
    }
    navigate("new");
  };

  return newElement;
};
