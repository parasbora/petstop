
import HomePage from "@/pages/HomePage";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
import { Route, Routes } from "react-router";
import Signup from "./pages/Signup";
import BrowsePage from "./pages/browsePage";
import Login from "./pages/Login";

function App() {
  return (
    //
    <div className="min-h-screen  bg-top mx-auto  bg-no-repeat justify-between  flex flex-col items-center pt-4 md:pt-8 pb-10  ">
      <Navbar />
    
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/browse" element={<BrowsePage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
