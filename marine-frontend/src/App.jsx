import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppDataProvider } from "./state/AppDataProvider";
import { LanguageProvider } from "./state/LanguageProvider";
import FloatingSOS from "./components/FloatingSOS";
import ProactiveHazardBanner from "./components/ProactiveHazardBanner";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FishingZones from "./pages/FishingZones";
import RoutesPage from "./pages/Routes";
import Alerts from "./pages/Alerts";
import AIAssistant from "./pages/AIAssistant";
import Ocean from "./pages/Ocean";
import Intelligence from "./pages/Intelligence";
import Government from "./pages/Government";
import Profile from "./pages/Profile";
import Map from "./pages/Map";
import EmergencySOS from "./pages/EmergencySOS";
import AuthorityDashboard from "./pages/AuthorityDashboard";

function App() {
  return (
    <LanguageProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Routes>

          {/* Landing */}
          <Route path="/" element={<Landing />} />
          <Route path="/login/:role" element={<Login />} />

          {/* Main Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<Map />} />
          <Route path="/fishing-zones" element={<FishingZones />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/ocean" element={<Ocean />} />
          <Route path="/sos" element={<EmergencySOS />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/government" element={<Government />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/authority" element={<AuthorityDashboard />} />

          </Routes>
          <ProactiveHazardBanner />
          <FloatingSOS />
        </BrowserRouter>
      </AppDataProvider>
    </LanguageProvider>
  );
}

export default App;