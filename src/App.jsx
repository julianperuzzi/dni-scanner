import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Login from './components/Login';
import ScanDni from './components/ScanDni';
import UserDniData from './components/UserDniData';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScanData from './components/ScanData';
import ManualEntry from './components/ManualEntry';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/data" element={<ScanData />} />
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <ScanDni />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manual-entry"
            element={
              <ProtectedRoute>
                <ManualEntry />
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
};

export default App;
