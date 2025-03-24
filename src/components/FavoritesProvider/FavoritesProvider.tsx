import customAxios from "@/api/custom-axios";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

interface Favorite {
  id: string;
  gameId: string;
  name: string;
  imageUri: string;
  userId: string;
  dateFavorited: string;
}

interface FavoritesContextType {
  favorites: Favorite[] | null;
  fetchFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Favorite[] | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await customAxios.get("/Favorite");
      setFavorites(response.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites(null);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const value: FavoritesContextType = {
    favorites,
    fetchFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
