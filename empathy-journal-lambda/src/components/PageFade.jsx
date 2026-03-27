import { useEffect, useState } from "react";

export default function PageFade({ children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
      {children}
    </div>
  );
}

