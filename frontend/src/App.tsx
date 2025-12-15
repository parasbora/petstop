
import HomePage from "@/pages/HomePage";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
import { Route, Routes } from "react-router";
import Signup from "./pages/Signup";
import BrowsePage from "./pages/browsePage";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import LayoutWrapper from "./components/LayoutWrapper";
import SitterProfile from "./components/SitterProfile";
import { Toaster } from "@/components/ui/sonner"
import { HealthCheck } from "./components/HealthCheck"
import EnhancedNotFound from "./components/EnhancedNotFound";
import ProtectedRoute from "./routes/ProtectedRoutes";


function App() {
 
  return (
    <>
      <LayoutWrapper>
        <Navbar  />
        <main className="row-start-2 w-full flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute >
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="/sitter-profile/:id" element={<SitterProfile />} />
            <Route path="/sitter-profile/not-found" element={<EnhancedNotFound />} />
          </Routes>
          <HealthCheck />
          <Toaster />
        </main>
        <Footer />
      </LayoutWrapper>
    </>
  );
}

export default App;