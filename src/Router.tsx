import { Route, Routes } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home/Home";

function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Home */}
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default Router;
