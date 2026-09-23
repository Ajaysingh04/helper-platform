import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component ensures that whenever the route changes,
 * the window automatically scrolls to the top of the page.
 */
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll immediately to the top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
