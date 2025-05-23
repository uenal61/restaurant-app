import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RatingForm from './pages/RatingForm';
import RestaurantForm from './pages/RestaurantForm';
import CriteriaEditor from './pages/CriteriaEditor';
import Statistics from './pages/Statistics';
import ProtectedRoute from './pages/ProtectedRoute';
import EditRating from './pages/EditRating';
import UserManagement from './pages/UserManagement';
import InviteRating from './pages/InviteRating';
import FixCriteria from './pages/FixCriteria';
import UserStatistics from './pages/UserStatistics';
import UserComparison from './pages/UserComparison';
import TopRestaurants from './pages/TopRestaurants';
import RestaurantDetails from './pages/RestaurantDetails';
import LandingPage from './pages/LandingPage';
import BlogView from './pages/BlogView';
import Layout from './Layout';

function App() {
  return (
    <Routes>
      {/* Öffentliche Seiten */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/invite/:token" element={<InviteRating />} />
      <Route path="/fix-criteria" element={<FixCriteria />} />
      <Route path="/blog" element={<BlogView />} />

      {/* Geschützte Seiten im Layout */}
      <Route element={<Layout />}>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rate/:restaurantId"
          element={
            <ProtectedRoute>
              <RatingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:restaurantId"
          element={
            <ProtectedRoute>
              <EditRating />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <RestaurantForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/criteria"
          element={
            <ProtectedRoute>
              <CriteriaEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-stats"
          element={
            <ProtectedRoute>
              <UserStatistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-comparison"
          element={
            <ProtectedRoute>
              <UserComparison />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/:id"
          element={
            <ProtectedRoute>
              <RestaurantDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/top" element={<TopRestaurants />} />
      </Route>
    </Routes>
  );
}

export default App;
