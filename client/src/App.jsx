import {
  Routes,
  Route,
} from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';

import TruckDetailsPage from './pages/TruckDetailsPage';

import FloorMapPage from './pages/floor/FloorMapPage';

import PickerPage from './pages/picker/PickerPage';

function App() {
  return (
    <Routes>
      {/* DASHBOARD */}
      <Route
        path="/"
        element={<DashboardPage />}
      />

      {/* TRUCK DETAILS */}
      <Route
        path="/truck/:id"
        element={
          <TruckDetailsPage />
        }
      />

      {/* FLOOR MAP */}
      <Route
        path="/floor"
        element={<FloorMapPage />}
      />

      {/* PICKER MODE */}
      <Route
        path="/picker"
        element={<PickerPage />}
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