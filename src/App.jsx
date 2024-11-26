// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Login from './components/Login';
import ScanDni from './components/ScanDni';
import UserDniData from './components/UserDniData';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => (
  <UserProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/scan"
          element={
            <ProtectedRoute>
              <ScanDni />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-data"
          element={
            <ProtectedRoute>
              <UserDniData />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </Router>
  </UserProvider>
);

export default App;
