import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import graduatingStudentsImg from "../assets/graduating_students.png";

const ROUTE_BACKGROUNDS = {
  "/": graduatingStudentsImg,
  "/login": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600&auto=format",
  "/register": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600&auto=format",
  "/items": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1600&auto=format",
  "/favorite": "https://images.unsplash.com/photo-1523050854-01023f1de670?q=80&w=1600&auto=format",
  "/my-account": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format",
  "/items/create": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1600&auto=format",
  "/orders": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format",
  "/urgent": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format",
  "/heatmap": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1600&auto=format",
  "/analytics": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format",
};

export default function PageBackdrop() {
  const location = useLocation();
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    const path = location.pathname;
    let matchedBg = ROUTE_BACKGROUNDS[path];

    if (!matchedBg) {
      if (path.startsWith("/item/")) {
        matchedBg = ROUTE_BACKGROUNDS["/items"];
      } else if (path.startsWith("/order/")) {
        matchedBg = ROUTE_BACKGROUNDS["/orders"];
      } else if (path.startsWith("/items/edit/")) {
        matchedBg = ROUTE_BACKGROUNDS["/items/create"];
      }
    }

    if (!matchedBg) {
      matchedBg = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format";
    }

    setBgImage(matchedBg);
  }, [location.pathname]);

  const isHome = location.pathname === "/";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <img
        src={bgImage}
        alt="Page Campus Background"
        className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
          isHome ? "opacity-60 dark:opacity-80" : "opacity-20 dark:opacity-40"
        }`}
      />
      <div 
        className={`absolute inset-0 transition-all duration-500 bg-gradient-to-b ${
          isHome
            ? "from-transparent via-white/50 to-[var(--bg-primary)] dark:via-black/50 dark:to-[var(--bg-primary)]"
            : "from-white/20 via-white/70 to-[var(--bg-primary)] dark:from-black/20 dark:via-black/70 dark:to-[var(--bg-primary)]"
        }`}
      />
    </div>
  );
}
