import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import ShowsPage from "./pages/ShowsPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminMoviesPage from "./pages/AdminMoviesPage";
import AdminTheatresPage from "./pages/AdminTheatresPage";
import AdminShowsPage from "./pages/AdminShowsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";

// Protected Route Wrapper for Logged-In Users
const UserRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Protected Route Wrapper for Administrators
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-dark text-light">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/movies/:id" element={<MovieDetailsPage />} />
              <Route path="/shows" element={<ShowsPage />} />
              <Route path="/shows/:id/seats" element={<SeatSelectionPage />} />

              {/* Protected User Routes */}
              <Route
                path="/bookings"
                element={
                  <UserRoute>
                    <BookingHistoryPage />
                  </UserRoute>
                }
              />
              <Route
                path="/bookings/:id"
                element={
                  <UserRoute>
                    <BookingConfirmationPage />
                  </UserRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <UserRoute>
                    <FavoritesPage />
                  </UserRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <UserRoute>
                    <ProfilePage />
                  </UserRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/movies"
                element={
                  <AdminRoute>
                    <AdminMoviesPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/theatres"
                element={
                  <AdminRoute>
                    <AdminTheatresPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/shows"
                element={
                  <AdminRoute>
                    <AdminShowsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <AdminRoute>
                    <AdminBookingsPage />
                  </AdminRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
