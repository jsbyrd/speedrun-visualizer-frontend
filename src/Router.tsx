import { Route, Routes } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home/Home";
import SpeedrunInfo from "./pages/SpeedrunInfo/SpeedrunInfo";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import SearchHistory from "./pages/SearchHistory/SearchHistory";
import Favorites from "./pages/Favorites/Favorites";
import ErrorPage from "./pages/Error/Error";

function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Home */}
        <Route path="/" element={<Home />} />
        {/* Login/Register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* User Specific Pages*/}
        <Route path="/search-history" element={<SearchHistory />} />
        <Route path="/favorites" element={<Favorites />} />
        {/* Game/Speedrun Page */}
        <Route path="/speedrun" element={<SpeedrunInfo />} />
        {/* Everything else is an error */}
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
}

export default Router;
