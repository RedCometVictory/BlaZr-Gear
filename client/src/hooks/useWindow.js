import { useEffect, useState } from "react";

const windowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
    return {
      width, height
    };
};

const useWindow = () => {
  const [windowSize, setWindowSize] = useState(windowDimensions());
  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize(windowDimensions());
    };
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return windowSize;
};
export default useWindow;