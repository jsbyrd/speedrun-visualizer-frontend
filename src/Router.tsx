import { Route, Routes } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home/Home";
import SpeedrunInfo from "./pages/SpeedrunInfo/SpeedrunInfo";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import SearchHistory from "./pages/SearchHistory/SearchHistory";

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
        {/* Game/Speedrun Page */}
        <Route path="/speedrun" element={<SpeedrunInfo />} />
      </Route>
    </Routes>
  );
}

export default Router;
