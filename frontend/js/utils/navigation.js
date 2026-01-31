/**
 * Initializes sidebar navigation
 * @param {NodeList} navItems - Navigation menu items
 * @param {Function} loadPageCallback - Callback function to load pages
 */
export function initializeNavigation(navItems, loadPageCallback) {
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all
      navItems.forEach((i) => i.classList.remove("active"));

      // Add active class to clicked item
      item.classList.add("active");

      // Get page from data attribute
      const page = item.getAttribute("data-page");
      loadPageCallback(page);
    });
  });
}
