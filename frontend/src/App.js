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
import CategoriesPage from "./components/CategoriesPage";
import ItemDetailsPage from "./components/ItemDetailsPage";
import LoginPage from "./components/LoginPage";
import GrowBusiness from "./components/GrowBusiness";
import Footer from "./components/Footer";
import AdminLayout from "./components/Admin/AdminLayout";
import ScrollToTop from "./components/ScrollToTop";
import VendorAuth from "./components/Vendor/VendorAuth";
import VendorDashboard from "./components/Vendor/VendorDashboard";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      {isAdminRoute ? (
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      ) : (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/grow-business" element={<GrowBusiness />} />
        <Route path="/advertise" element={<GrowBusiness />} />
        <Route path="/free-listing" element={<GrowBusiness />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/vendor" element={<VendorAuth defaultTab="login" />} />
        <Route path="/vendor/login" element={<VendorAuth defaultTab="login" />} />
        <Route path="/vendor/register" element={<VendorAuth defaultTab="register" />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
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
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/details/:id" element={<ItemDetailsPage />} />
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
      
      <Footer />
    </div>
      )}
    </>
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
