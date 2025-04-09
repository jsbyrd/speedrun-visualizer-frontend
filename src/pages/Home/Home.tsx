import { NavLink } from "react-router";
import gameData from "./game-data";
import { pageLayout } from "@/lib/common-styles";

const Home = () => {
  return (
    <div className={pageLayout}>
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-center leading-tight mb-8">
        Visualize Speedrunning History
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl text-center mb-12">
        Explore the evolution of speedruns and records over time.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {gameData.map((game) => (
          <NavLink
            key={game.gameId}
            to={`/speedrun?gameId=${game.gameId}`}
            className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg p-6 shadow-lg flex flex-col items-center"
          >
            <img
              src={game.imgSrc}
              alt={game.imgAlt}
              className="w-24 h-36 object-cover mb-4"
            />
            <h2 className="text-xl font-bold mb-2">{game.name}</h2>
            <p className="text-center text-sm">{game.description}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Home;
