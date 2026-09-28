import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const status = localStorage.getItem("isLoggedIn");
    const vendor = localStorage.getItem("helper_vendor");
    const userProfile = localStorage.getItem("helper_user_profile");
    const admin = localStorage.getItem("helper_admin_auth");
    return status === "true" || Boolean(vendor) || Boolean(userProfile) || admin === "true";
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const admin = localStorage.getItem("helper_admin_auth");
      if (admin === "true") {
        return {
          name: "Super Admin",
          role: "Administrator",
          email: "admin@helper.com"
        };
      }
      const vendor = localStorage.getItem("helper_vendor");
      if (vendor) {
        const p = JSON.parse(vendor);
        return {
          name: p.name || p.shopName || "Vendor Partner",
          role: "Partner",
          email: p.phone || "partner@helper.com"
        };
      }
      const user = localStorage.getItem("helper_user_profile");
      if (user) {
        const p = JSON.parse(user);
        return {
          name: p.name || "Customer",
          role: "Customer",
          email: p.email || p.mobile || "",
          mobile: p.mobile || "",
          avatar: p.avatar || "",
          address: p.address || "",
          city: p.city || ""
        };
      }
    } catch (e) {}
    return { name: "Ajay Singh Banafer", role: "Member", email: "ajay@example.com", avatar: "" };
  });

  const checkAuth = useCallback(() => {
    const status = localStorage.getItem("isLoggedIn");
    const vendor = localStorage.getItem("helper_vendor");
    const userProfile = localStorage.getItem("helper_user_profile");
    const admin = localStorage.getItem("helper_admin_auth");
    const logged = status === "true" || Boolean(vendor) || Boolean(userProfile) || admin === "true";

    setIsLoggedIn(logged);

    if (logged) {
      try {
        if (admin === "true") {
          setCurrentUser({
            name: "Super Admin",
            role: "Administrator",
            email: "admin@helper.com"
          });
        } else if (vendor) {
          const p = JSON.parse(vendor);
          setCurrentUser({
            name: p.name || p.shopName || "Vendor Partner",
            role: "Partner",
            email: p.phone || "partner@helper.com"
          });
        } else if (userProfile) {
          const p = JSON.parse(userProfile);
          setCurrentUser({
            name: p.name || "Customer",
            role: "Customer",
            email: p.email || p.mobile || "",
            mobile: p.mobile || "",
            avatar: p.avatar || "",
            address: p.address || "",
            city: p.city || ""
          });
        } else {
          setCurrentUser({ name: "Ajay Singh Banafer", role: "Member", email: "ajay@example.com", avatar: "" });
        }
      } catch (e) {}
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth_state_changed", checkAuth);
    window.addEventListener("user_profile_updated", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth_state_changed", checkAuth);
      window.removeEventListener("user_profile_updated", checkAuth);
    };
  }, [checkAuth]);

  const login = (userData = null) => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    if (userData) {
      setCurrentUser(userData);
    } else {
      checkAuth();
    }
    window.dispatchEvent(new Event("auth_state_changed"));
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("helper_user_profile");
    localStorage.removeItem("helper_vendor");
    localStorage.removeItem("helper_vendor_token");
    localStorage.removeItem("helper_admin_auth");
    localStorage.removeItem("helper_admin_token");
    localStorage.removeItem("helper_admin_role");
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.dispatchEvent(new Event("auth_state_changed"));
    window.dispatchEvent(new Event("user_profile_updated"));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
