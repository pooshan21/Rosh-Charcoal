import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const client = axios.create({ baseURL: API });

// Attach admin bearer token (avoids credentialed CORS; public calls send no creds)
client.interceptors.request.use((config) => {
  const t = localStorage.getItem("rc_token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export const CONTACT = {
  instagram: "https://www.instagram.com/roshcharcoal?igsh=MTVoNzlzMGhoa3dpeQ==",
  whatsappNumber: "+91 9035615236",
  whatsappDigits: "919035615236",
  email: "roshcharcoal@gmail.com",
};

export const waLink = (msg) =>
  `https://wa.me/${CONTACT.whatsappDigits}?text=${encodeURIComponent(msg)}`;

export const rupee = (n) =>
  n == null ? null : "\u20B9" + n.toLocaleString("en-IN");

export const NAV = [
  { label: "Gallery", to: "/gallery" },
  { label: "Prints", to: "/prints" },
  { label: "Original Artworks", to: "/original-artworks" },
  { label: "About", to: "/about" },
  { label: "Journal", to: "/journal" },
];

export const SHIPPING_FEE = 300;

export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
