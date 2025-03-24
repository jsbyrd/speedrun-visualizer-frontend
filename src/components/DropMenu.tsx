import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "./UserProvider/use-user-hook";
import { Heart, History, LogOut, Settings, User } from "lucide-react";
import customAxios from "@/api/custom-axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const DropMenu = () => {
  const { username, handleLogout } = useUser();
  const navigate = useNavigate();

  const handleLogoutPress = async () => {
    try {
      await customAxios.post("/Auth/logout");
      toast("Successful logout", {
        description: `You have logged out of ${username}, goodbye 😞`,
      });
      handleLogout();
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast.error(
          `Error Code ${error.status} (${error.response?.data?.error})`,
          {
            description: `${
              error.response?.data?.message ??
              "Something went wrong, please try again later."
            }`,
          }
        );
      } else {
        toast.error("Error: Unable to log out", {
          description:
            "There was an issue when trying to log out. Please try again later.",
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="ml-4 hover:cursor-pointer">
          <AvatarImage src="/default_pfp.svg" alt="default profile picture" />
          <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              navigate("/");
            }}
            disabled
          >
            <User />
            {username}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigate("/");
            }}
            disabled
          >
            <Settings />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              navigate("/favorites");
            }}
          >
            <Heart />
            Favorites
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigate("/search-history");
            }}
          >
            <History />
            Search History
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogoutPress}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropMenu;
