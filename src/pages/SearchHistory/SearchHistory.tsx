import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router";
// import { Trash } from "lucide-react";
import customAxios from "@/api/custom-axios";
import { pageLayout } from "@/lib/common-styles";
import ReactPaginate from "react-paginate";

interface SearchHistoryItem {
  id: string;
  gameId: string;
  name: string;
  imageUri: string;
  lastSearched: string;
}

const SearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0); // React Paginate uses 0-based index
  const itemsPerPage = 5;

  const fetchSearchHistory = useCallback(async () => {
    try {
      const response = await customAxios.get("/SearchHistory");
      setSearchHistory(response.data);
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  }, []);

  useEffect(() => {
    fetchSearchHistory();
  }, [fetchSearchHistory]);

  // const handleDelete = async (id: string) => {
  //   try {
  //     await customAxios.delete(`/SearchHistory/${id}`);
  //     fetchSearchHistory(); // Refresh after delete
  //   } catch (error) {
  //     console.error("Error deleting search history item:", error);
  //   }
  // };

  const pageCount = Math.ceil(searchHistory.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const paginatedSearchHistory = searchHistory.slice(
    offset,
    offset + itemsPerPage
  );

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
        Search History
      </h1>
      {searchHistory.length === 0 ? (
        <p className="text-white">No search history found.</p>
      ) : (
        <div className="flex flex-col justify-between w-full h-full">
          <ul className="mt-2 overflow-y-auto w-full">
            {paginatedSearchHistory.map((item) => (
              <li
                key={item.id}
                className="flex items-center p-2 text-white hover:bg-white/20"
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
                  <span className="text-lg select-none">
                    {formatDate(item.lastSearched)}
                  </span>
                </NavLink>
                {/* <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500"
                >
                  <Trash className="w-4 h-4" />
                </button> */}
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

export default SearchHistory;
