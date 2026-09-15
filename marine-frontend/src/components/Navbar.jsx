import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useLanguage } from "../state/useLanguage";
import { languageOptions } from "../i18n/translations";
import "./Navbar.css";


function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeLanguage = languageOptions.find((option) => option.code === language) || languageOptions[0];

  // Note: Navbar is rendered per-page (each page mounts its own <Navbar />
  // rather than a shared layout route), so it fully remounts on every
  // navigation and mobileMenuOpen naturally resets to false — no effect
  // needed to close the menu on route change.

  const navItems = [
    { to: "/dashboard", icon: <Home size={15} />, label: t("nav.home") },
    { to: "/map", icon: <Map size={15} />, label: t("nav.map") },
    { to: "/fishing-zones", icon: <Waves size={15} />, label: t("nav.fishingZones") },
    { to: "/routes", icon: <Route size={15} />, label: t("nav.routes") },
    { to: "/alerts", icon: <Bell size={15} />, label: t("nav.alerts") },
    { to: "/ai-assistant", icon: <Bot size={15} />, label: t("nav.aiAssistant") },
    { to: "/ocean", icon: <Waves size={15} />, label: t("nav.ocean") },
    { to: "/intelligence", icon: <Brain size={15} />, label: t("nav.intelligence") },
    { to: "/government", icon: <Landmark size={15} />, label: t("nav.support") },
  ];

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


      {/* Navigation (desktop / tablet) */}
      <nav className="navbar-links">
        {navItems.map((item) => (
          <NavItem key={item.to} to={item.to} icon={item.icon}>
            {item.label}
          </NavItem>
        ))}
      </nav>


      {/* Right actions */}
      <div className="navbar-actions">

        <button
          className="nav-icon-button notification-button"
          aria-label={`${t("nav.alerts")}, 1 unread`}
        >
          <Bell size={17} />
          <span className="notification-dot" aria-hidden="true">1</span>
        </button>

        <div className="language-switcher">
          <button
            className="language-button"
            onClick={() => setLanguageMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={languageMenuOpen}
            aria-label={t("nav.language")}
          >
            <Globe size={15} />
            {activeLanguage.code.toUpperCase()}
          </button>

          {languageMenuOpen && (
            <ul className="language-menu" role="listbox">
              {languageOptions.map((option) => (
                <li key={option.code}>
                  <button
                    role="option"
                    aria-selected={option.code === language}
                    className={option.code === language ? "active" : ""}
                    onClick={() => {
                      setLanguage(option.code);
                      setLanguageMenuOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <NavLink to="/sos" className="sos-button" aria-label="Emergency SOS">
          <Siren size={15} />
          SOS
        </NavLink>

        <NavLink to="/profile" className="profile-button" aria-label={t("nav.profile")}>
          <User size={17} />
        </NavLink>

        {/* Hamburger toggle — only rendered visibly below ~700px via CSS */}
        <button
          className="nav-hamburger"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
        >
          {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>

      </div>

      {/* Mobile navigation overlay */}
      {mobileMenuOpen && (
        <nav id="mobile-nav-menu" className="mobile-nav-menu" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}

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