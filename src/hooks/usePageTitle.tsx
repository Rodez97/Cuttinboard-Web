import { useEffect } from "react";

function usePageTitle(pageTitle: string) {
  useEffect(() => {
    const first = document.title;
    document.title = `CB | ${pageTitle}`;

    return () => {
      document.title = first;
    };
  }, [pageTitle]);
}

export default usePageTitle;
