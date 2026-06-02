const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const quoteForm = document.querySelector("[data-quote-form]");
const formZaloButton = document.querySelector("[data-form-zalo]");
const copyMessageButton = document.querySelector("[data-copy-message]");
const formStatus = document.querySelector("[data-form-status]");
const fareSmsLinks = document.querySelectorAll("[data-fare-sms]");
const fareZaloLinks = document.querySelectorAll("[data-fare-zalo]");
const hotline = "0378104668";
const zaloUrl = `https://zalo.me/${hotline}`;

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const buildQuoteMessage = () => {
  const data = new FormData(quoteForm);
  return [
    "Yeu cau bao gia taxi ghep:",
    `Ho ten: ${data.get("name") || "Chua cung cap"}`,
    `So dien thoai: ${data.get("phone") || "Chua cung cap"}`,
    `Diem don: ${data.get("pickup") || "Chua cung cap"}`,
    `Diem den: ${data.get("dropoff") || "Chua cung cap"}`,
    `Ghi chu: ${data.get("route") || "Khong co"}`,
  ].join("\n");
};

const buildFareMessage = (link) => {
  const card = link.closest("[data-route]");
  return [
    "Toi muon dat xe taxi ghep:",
    `Tuyen: ${card.dataset.route}`,
    `Loai: ${link.dataset.type}`,
    `Gia tham khao: ${link.dataset.price}`,
    "Vui long tu van va xac nhan giup toi.",
  ].join("\n");
};

const openSms = (message) => {
  window.location.href = `sms:${hotline}?body=${encodeURIComponent(message)}`;
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textArea);
  return copied;
};

const openZalo = async (message) => {
  try {
    await copyText(message);
    formStatus.className = "form-status is-success";
    formStatus.textContent = "Đã sao chép nội dung. Đang mở Zalo, hãy dán nội dung vào khung chat.";
  } catch (error) {
    formStatus.className = "form-status is-error";
    formStatus.textContent = "Không sao chép được nội dung. Zalo vẫn sẽ được mở.";
  }

  window.open(zaloUrl, "_blank", "noopener");
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
  formStatus.className = "form-status is-success";
  formStatus.textContent = "Đang mở SMS với nội dung đã điền sẵn.";
  openSms(buildQuoteMessage());
});

formZaloButton.addEventListener("click", () => {
  openZalo(buildQuoteMessage());
});

copyMessageButton.addEventListener("click", async () => {
  try {
    await copyText(buildQuoteMessage());
    formStatus.className = "form-status is-success";
    formStatus.textContent = "Đã sao chép nội dung. Bạn có thể dán vào Zalo, SMS hoặc email.";
  } catch (error) {
    formStatus.className = "form-status is-error";
    formStatus.textContent = "Không sao chép được. Vui lòng thử lại hoặc gọi hotline.";
  }
});

fareSmsLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openSms(buildFareMessage(link));
  });
});

fareZaloLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openZalo(buildFareMessage(link));
  });
});
