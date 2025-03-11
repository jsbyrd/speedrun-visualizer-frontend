import { Pen, Square } from "lucide-react";
import { NavLink } from "react-router";

const primaryButtonStyling: string =
  "bg-primary text-primary-foreground shadow hover:bg-primary/90";
const secondaryButtonStyling: string =
  "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80";

const Home = () => {
  return (
    <div className="flex flex-wrap md:flex-nowrap h-full w-full justify-center items-center gap-16 py-10 px-10">
      <div className="flex flex-col gap-10">
        <h1 className="text-5xl leading-normal text-center flex flex-wrap justify-center font-bold">
          <span className="whitespace-nowrap">Practice All</span>
          &nbsp;
          <span className="whitespace-nowrap">Aspects</span>
          &nbsp;
          <span className="whitespace-nowrap">of Chess!</span>
        </h1>
        <div className="flex flex-col items-center gap-5 justify-around h-full">
          <NavLink
            to="/coordinates/search-square"
            className={`${primaryButtonStyling} flex items-center p-4 gap-6 block min-w-80 max-w-[30rem] w-full h-28 rounded-lg`}
          >
            <Square className="w-16 h-16" strokeWidth={2} />
            <div className="w-full h-full flex flex-between gap-2 items-center">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold">Search Square</h2>
                <p className="text-wrap line-clamp-2">
                  Get better at recognizing chess coordinates!
                </p>
              </div>
            </div>
          </NavLink>
          <NavLink
            to="/coordinates/name-notation"
            className={`${secondaryButtonStyling} flex items-center p-4 gap-6 block min-w-80 max-w-[30rem] w-full h-28 rounded-lg`}
          >
            <Pen className="w-16 h-16" strokeWidth={2} />
            <div className="w-full h-full flex flex-between gap-2 items-center">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold">Name Notation</h2>
                <p className="text-wrap line-clamp-2">
                  Name moves in chess notation as fast as possible!
                </p>
              </div>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Home;
