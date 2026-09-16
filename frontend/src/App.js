import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { LocationProvider } from "./context/LocationContext";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

import Header from "./components/Header";
import Home from "./components/Home";
import About from "./components/About";
import Services from "./components/Services";
import ContactUs from "./components/ContactUs";
import Settings from "./components/Settings";
import NotificationPage from "./components/ProfileComponent/NotificationPage";
import EditProfile from "./components/ProfileComponent/EditProfile";
import Security from "./components/SettingComponent/Security";
import ContactSupport from "./components/SettingComponent/ContactSupport";
import Help from "./components/SettingComponent/Help";
import Profile from "./components/ProfileComponent/Profile";
import Explore from "./components/PopularServices/Explore";
import CategoryPage from "./components/CategoryPage";
import ItemDetailsPage from "./components/ItemDetailsPage";
import LoginPage from "./components/LoginPage";
import Footer from "./components/Footer";
import AdminLayout from "./components/Admin/AdminLayout";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    );
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/security" element={<Security />} />
        <Route path="/change-password" element={<Security />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/category/:name" element={<CategoryPage />} />
        <Route path="/details/:id" element={<ItemDetailsPage />} />
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
