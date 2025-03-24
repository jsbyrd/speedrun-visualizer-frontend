import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { Trash } from "lucide-react";
import { pageLayout } from "@/lib/common-styles";
import ReactPaginate from "react-paginate";
import { useFavorites } from "@/components/FavoritesProvider/FavoritesProvider";
import customAxios from "@/api/custom-axios";

const Favorites = () => {
  const { favorites, fetchFavorites } = useFavorites();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!favorites) {
      fetchFavorites();
    }
  }, [favorites, fetchFavorites]);

  const handleDelete = async (id: string) => {
    try {
      await customAxios.delete(`/Favorite/${id}`);
      await fetchFavorites();
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  };

  const pageCount = favorites ? Math.ceil(favorites.length / itemsPerPage) : 0;
  const offset = currentPage * itemsPerPage;
  const paginatedFavoriteGames = favorites
    ? favorites.slice(offset, offset + itemsPerPage)
    : [];

  const handlePageClick = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + "Z");
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    };
    return date.toLocaleString(undefined, options);
  };

  return (
    <div className={`${pageLayout} items-center h-full`}>
      <h1 className="py-4 mt-2 text-4xl font-semibold text-white">
        Favorite Games
      </h1>
      {favorites?.length === 0 ? (
        <p className="text-white">No favorite games found.</p>
      ) : (
        <div className="flex flex-col justify-between w-full h-full">
          <ul className="mt-2 overflow-y-auto w-full">
            {paginatedFavoriteGames.map((item) => (
              <li
                key={item.id}
                className="flex items-center p-2 text-white hover:bg-white/20 gap-10"
              >
                <NavLink
                  to={`/speedrun?gameId=${item.gameId}`}
                  className="flex items-center flex-grow"
                >
                  {item.imageUri && (
                    <img
                      src={item.imageUri}
                      alt={item.name}
                      className="w-8 h-12 object-cover mr-2"
                    />
                  )}
                  <span className="flex-grow text-lg">{item.name}</span>
                </NavLink>
                <div className="flex items-center gap-4">
                  <span className="text-lg select-none">
                    {formatDate(item.dateFavorited)}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="ml-2 px-2 py-2 transition-colors duration-200 hover:cursor-pointer hover:text-red-500"
                  >
                    <Trash className="w-6 h-6" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="<"
            renderOnZeroPageCount={null}
            containerClassName="flex justify-center mt-4"
            pageClassName="mx-1"
            pageLinkClassName="px-3 py-1 rounded-md bg-blue-700 hover:bg-blue-700/70 text-white select-none"
            previousClassName="mx-1"
            previousLinkClassName="px-3 py-1 rounded-md bg-blue-700 hover:bg-blue-700/70 text-white hover:cursor-default select-none"
            nextClassName="mx-1"
            nextLinkClassName="px-3 py-1 rounded-md bg-blue-700 hover:bg-blue-700/70 text-white hover:cursor-default select-none"
            breakClassName="mx-1"
            breakLinkClassName="px-3 py-1 rounded-md bg-blue-700 hover:bg-blue-700/70 text-white"
            activeClassName="bg-transparent"
            activeLinkClassName="bg-sky-500 text-white hover:bg-sky-500/80 border border-white"
          />
        </div>
      )}
    </div>
  );
};

export default Favorites;
