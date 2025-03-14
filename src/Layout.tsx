// Layout.tsx
import { Outlet } from "react-router";
import Header from "./components/Header";
import { useBackdrop } from "./components/BackdropProvider/BackdropProvider";

const Layout = () => {
  const { backdropVisible } = useBackdrop();

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {backdropVisible && (
        <div className="fixed inset-0 bg-black opacity-50 z-50" />
      )}
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
