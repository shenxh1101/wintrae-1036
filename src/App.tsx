import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "@/pages/MainMenu";
import TeamSetup from "@/pages/TeamSetup";
import Exploring from "@/pages/Exploring";
import Battle from "@/pages/Battle";
import EventRoom from "@/pages/EventRoom";
import Inventory from "@/pages/Inventory";
import Result from "@/pages/Result";
import Codex from "@/pages/Codex";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-primary text-gold-100">
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/team-setup" element={<TeamSetup />} />
          <Route path="/exploring" element={<Exploring />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/event" element={<EventRoom />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/result" element={<Result />} />
          <Route path="/codex" element={<Codex />} />
          <Route path="/settings" element={<Settings />} />
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-gold-400 mb-4">404</h1>
                <p className="text-gold-500 mb-6">页面未找到</p>
                <a 
                  href="/" 
                  className="px-6 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors"
                >
                  返回主菜单
                </a>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}
