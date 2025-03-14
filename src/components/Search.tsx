import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useBackdrop } from "@/components/BackdropProvider/BackdropProvider";
import { NavLink } from "react-router";

interface Game {
  id: string;
  names: { international: string };
  assets: { "cover-tiny": { uri: string } };
  weblink: string;
}

const Search = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { setBackdropVisible } = useBackdrop();

  const fetchGames = useCallback(async (query: string) => {
    try {
      const response = await fetch(
        `https://www.speedrun.com/api/v1/games?name=${encodeURIComponent(
          query
        )}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data.data);
    } catch (error) {
      console.error("Error fetching games:", error);
      setSearchResults([]);
    }
  }, []);

  const debouncedSearch = useCallback(
    (query: string) => {
      const timerId = setTimeout(() => {
        if (query) {
          fetchGames(query);
        } else {
          setSearchResults([]);
        }
      }, 300); // Debounce delay of 300ms
      return () => clearTimeout(timerId);
    },
    [fetchGames]
  );

  useEffect(() => {
    if (searchTerm) {
      const cleanup = debouncedSearch(searchTerm);
      return cleanup;
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchResults([]);
        setSearchTerm("");
        setBackdropVisible(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setBackdropVisible]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setOpen(true);
    setBackdropVisible(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // New function to handle item selection
  const handleSearchItemClick = () => {
    setOpen(false);
    setSearchResults([]);
    setSearchTerm("");
    setBackdropVisible(false);
  };

  return (
    <div>
      <Button
        variant="outline"
        className="w-[200px] justify-start text-left text-gray-800"
        onClick={handleSearchButtonClick}
      >
        <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
        Search Games...
      </Button>
      {open && (
        <>
          <div
            ref={popoverRef}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-screen max-w-[80vw] p-4 z-100 bg-background"
          >
            <Input
              ref={searchInputRef}
              placeholder="Search games..."
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            <div className="mt-2 max-h-[300px] overflow-y-auto">
              {searchResults?.map((game) => (
                <NavLink
                  key={game.id}
                  to={`/speedrun?gameId=${game.id}`}
                  className="flex items-center p-2 hover:bg-secondary rounded"
                  onClick={handleSearchItemClick} // Call the function on click
                >
                  {game.assets["cover-tiny"] && (
                    <img
                      src={game.assets["cover-tiny"].uri}
                      alt={game.names.international}
                      className="w-8 h-12 object-cover mr-2"
                    />
                  )}
                  <span>{game.names.international}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Search;
