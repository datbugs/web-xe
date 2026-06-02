const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const quoteForm = document.querySelector("[data-quote-form]");

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(quoteForm);
  const message = [
    "Yeu cau bao gia taxi ghep:",
    `Ho ten: ${data.get("name") || "Chua cung cap"}`,
    `So dien thoai: ${data.get("phone")}`,
    `Lich trinh: ${data.get("route")}`,
  ].join("\n");

  window.location.href = `sms:0378104668?body=${encodeURIComponent(message)}`;
});
