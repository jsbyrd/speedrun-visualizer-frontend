import { buttonVariants } from "@/components/ui/button";
import { NavLink } from "react-router";
import { useUser } from "./UserProvider/use-user-hook";
import { useMemo } from "react";
import DropMenu from "./DropMenu";
import Search from "./Search";
import { useBackdrop } from "./BackdropProvider/BackdropProvider";

const Header = () => {
  const { username, isLoggedIn } = useUser();
  const { backdropVisible } = useBackdrop();

  const rightSideHeader = useMemo(() => {
    return isLoggedIn ? (
      <DropMenu />
    ) : (
      <>
        <NavLink
          to="/login"
          className="text-white hover:text-gray-200 px-4 py-2 rounded-md transition-colors"
        >
          Login
        </NavLink>
        <NavLink
          to="/register"
          className="text-white hover:text-gray-200 px-4 py-2 rounded-md transition-colors"
        >
          Sign Up
        </NavLink>
      </>
    );
  }, [isLoggedIn, username]);

  return (
    <header className="fixed flex justify-between items-center md:justify-around h-14 top-0 z-50 w-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/20">
      {/* Reduced background opacity to 70 */}
      {backdropVisible && (
        <div className="fixed inset-0 bg-black opacity-50 z-40" />
      )}
      {/* Logo */}
      <NavLink to="/" className="hidden md:flex items-center space-x-2">
        <span className="font-bold text-gray-100">
          {/* Changed text color to gray-400 */}
          Speedrun Visualizer
        </span>
      </NavLink>

      <Search />

      {/* Right side actions */}
      <div className="flex items-center gap-4 px-4">{rightSideHeader}</div>
    </header>
  );
};

export default Header;
