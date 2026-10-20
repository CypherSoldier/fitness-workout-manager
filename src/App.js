import "./App.css";
import "./styles/navbar.css";
import "./styles/login.css";
import "./styles/saveExe.css";
import "./styles/searchbar.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Body from "./pages/Dashboard";
import AnalyticsPage from "./pages/AnalyticsPage";
import Layout from "./components/layout/Layout";
import ProfilePage from "./pages/Profile";
import GenerateWorkout from "./pages/GenerateWorkout";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes – only show when logged in */}
        <Route
          element={
            loading ? (
              <div>Loading...</div>
            ) : user ? (
              <Layout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<Body />} />
          <Route path="/CypherSoldier/Analytics" element={<AnalyticsPage />} />
          <Route path="/CypherSoldier/Profile" element={<ProfilePage />} />
          <Route path="/workouts/generate" element={<GenerateWorkout />} />

          {/* Catch-all redirect for logged-in users */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
