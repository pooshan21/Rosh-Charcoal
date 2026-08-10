import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const client = axios.create({ baseURL: API, withCredentials: true });

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
