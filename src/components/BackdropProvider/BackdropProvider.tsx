// context.tsx
import { createContext, useState, useContext } from "react";

type BackdropContextType = {
  backdropVisible: boolean;
  setBackdropVisible: (visible: boolean) => void;
};

const BackdropContext = createContext<BackdropContextType | null>(null);

export const BackdropProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [backdropVisible, setBackdropVisible] = useState(false);

  return (
    <BackdropContext.Provider value={{ backdropVisible, setBackdropVisible }}>
      {children}
    </BackdropContext.Provider>
  );
};

export const useBackdrop = () => {
  const context = useContext(BackdropContext);
  if (!context) {
    throw new Error("useBackdrop must be used within a BackdropProvider");
  }
  return context;
};
