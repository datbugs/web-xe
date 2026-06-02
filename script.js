const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const quoteForm = document.querySelector("[data-quote-form]");
const formZaloButton = document.querySelector("[data-form-zalo]");
const formStatus = document.querySelector("[data-form-status]");
const fareSmsLinks = document.querySelectorAll("[data-fare-sms]");
const fareZaloLinks = document.querySelectorAll("[data-fare-zalo]");
const cardFareToggles = document.querySelectorAll("[data-card-fare-toggle]");
const fareCards = document.querySelectorAll(".fare-card[data-destination]");
const hotline = "0378104668";
const zaloUrl = `https://zalo.me/${hotline}`;

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

if (window.lucide) {
  window.lucide.createIcons();
}

const buildQuoteMessage = () => {
  const data = new FormData(quoteForm);
  return [
    "Yêu cầu báo giá taxi ghép:",
    `Họ tên: ${data.get("name") || "Chưa cung cấp"}`,
    `Số điện thoại: ${data.get("phone") || "Chưa cung cấp"}`,
    `Điểm đón: ${data.get("pickup") || "Chưa cung cấp"}`,
    `Điểm đến: ${data.get("dropoff") || "Chưa cung cấp"}`,
    `Ghi chú: ${data.get("route") || "Không có"}`,
  ].join("\n");
};

const buildFareMessage = (link) => {
  const card = link.closest("[data-route]");
  return [
    "Tôi muốn đặt xe taxi ghép:",
    `Tuyến: ${card.dataset.route}`,
    `Loại: ${link.dataset.type}`,
    `Giá tham khảo: ${link.dataset.price}`,
    "Vui lòng tư vấn và xác nhận giúp tôi.",
  ].join("\n");
};

const updateFareCardDirection = (card, direction) => {
  const isFromHanoi = direction === "from-hanoi";
  const destination = card.dataset.destination;
  const title = card.querySelector("h3");
  const fromLabel = card.querySelector("[data-route-from]");
  const toLabel = card.querySelector("[data-route-to]");
  const isCustomRoute = destination === "Theo lịch trình";

  const from = isFromHanoi ? "Hà Nội" : destination;
  const to = isFromHanoi ? destination : "Hà Nội";
  card.dataset.route = `${from} - ${to}`;
  card.dataset.fareDirection = direction;

  if (fromLabel) fromLabel.textContent = from;
  if (toLabel) toLabel.textContent = to;

  if (!title) return;

  if (isCustomRoute) {
    title.textContent = isFromHanoi
      ? "Gọi xe ghép Hà Nội đi các tỉnh theo yêu cầu"
      : "Gọi xe ghép các tỉnh về Hà Nội theo yêu cầu";
    return;
  }

  title.textContent = isFromHanoi
    ? `Gọi xe ghép Hà Nội đi ${destination} 5 - 7 chỗ giá rẻ`
    : `Gọi xe ghép ${destination} về Hà Nội 5 - 7 chỗ giá rẻ`;
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
    formStatus.textContent = "Zalo không tự điền tin nhắn. Nội dung đã được sao chép, hãy dán vào khung chat Zalo.";
  } catch (error) {
    formStatus.className = "form-status is-error";
    formStatus.textContent = "Zalo không tự điền tin nhắn. Không sao chép được nội dung, vui lòng nhập thủ công.";
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

fareCards.forEach((card) => {
  updateFareCardDirection(card, "from-hanoi");
});

cardFareToggles.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".fare-card[data-destination]");
    if (!card) return;
    const nextDirection =
      card.dataset.fareDirection === "to-hanoi" ? "from-hanoi" : "to-hanoi";
    updateFareCardDirection(card, nextDirection);
  });
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
