import {
  Anchor,
  Home,
  Map,
  Waves,
  Route,
  Bell,
  Bot,
  Brain,
  Landmark,
  User,
  Globe,
  Siren,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">

      {/* Logo */}
      <NavLink to="/dashboard" className="navbar-brand">
        <div className="navbar-logo">
          <Anchor size={19} />
        </div>

        <div>
          <div className="navbar-title">SAMUDRA</div>
          <div className="navbar-subtitle">
            MARINE INTELLIGENCE
          </div>
        </div>
      </NavLink>


      {/* Navigation */}
      <nav className="navbar-links">

        <NavItem to="/dashboard" icon={<Home size={15} />}>
          Home
        </NavItem>

        <NavItem to="/map" icon={<Map size={15} />}>
          Map
        </NavItem>

        <NavItem to="/fishing-zones" icon={<Waves size={15} />}>
          Fishing Zones
        </NavItem>

        <NavItem to="/routes" icon={<Route size={15} />}>
          Routes
        </NavItem>

        <NavItem to="/alerts" icon={<Bell size={15} />}>
          Alerts
        </NavItem>

        <NavItem to="/ai-assistant" icon={<Bot size={15} />}>
          AI Assistant
        </NavItem>

        <NavItem to="/ocean" icon={<Waves size={15} />}>
          Ocean
        </NavItem>

        <NavItem to="/intelligence" icon={<Brain size={15} />}>
          Intelligence
        </NavItem>

        <NavItem to="/government" icon={<Landmark size={15} />}>
          Support
        </NavItem>

      </nav>


      {/* Right actions */}
      <div className="navbar-actions">

        <button className="nav-icon-button notification-button">
          <Bell size={17} />
          <span className="notification-dot">1</span>
        </button>

        <button className="language-button">
          <Globe size={15} />
          EN
        </button>

        <NavLink to="/sos" className="sos-button">
          <Siren size={15} />
          SOS
        </NavLink>

        <NavLink to="/profile" className="profile-button">
          <User size={17} />
        </NavLink>

      </div>

    </header>
  );
}


function NavItem({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`
      }
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  );
}

export default Navbar;