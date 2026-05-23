import {
  Routes,
  Route,
} from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';

import TruckDetailsPage from './pages/TruckDetailsPage';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<DashboardPage />}
      />

      <Route
        path="/truck/:id"
        element={
          <TruckDetailsPage />
        }
      />

      {/* FALLBACK */}
      <Route
        path="*"
        element={<DashboardPage />}
      />
    </Routes>
  );
}

export default App;