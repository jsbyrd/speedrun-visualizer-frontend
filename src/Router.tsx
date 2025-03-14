import { Route, Routes } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home/Home";
import SpeedrunInfo from "./pages/SpeedrunInfo/SpeedrunInfo";

function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Home */}
        <Route path="/" element={<Home />} />
        {/* Game/Speedrun Page */}
        <Route path="/speedrun" element={<SpeedrunInfo />} />
      </Route>
    </Routes>
  );
}

export default Router;
