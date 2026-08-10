import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import SmoothScroll from "./components/SmoothScroll";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import ArtworkDetail from "./pages/ArtworkDetail";
import Pricing from "./pages/Pricing";
import Commissions from "./pages/Commissions";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Journal from "./pages/Journal";
import JournalArticle from "./pages/JournalArticle";
import Prints from "./pages/Prints";
import OriginalArtworks from "./pages/OriginalArtworks";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

const Site = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <div className="App grain">
      <BrowserRouter>
        <SmoothScroll>
          <Toaster position="bottom-right" theme="light" />
          <Routes>
            <Route path="/" element={<Site><Home /></Site>} />
            <Route path="/gallery" element={<Site><Gallery /></Site>} />
            <Route path="/artwork/:slug" element={<Site><ArtworkDetail /></Site>} />
            <Route path="/pricing" element={<Site><Pricing /></Site>} />
            <Route path="/prints" element={<Site><Prints /></Site>} />
            <Route path="/original-artworks" element={<Site><OriginalArtworks /></Site>} />
            <Route path="/commissions" element={<Site><Commissions /></Site>} />
            <Route path="/about" element={<Site><About /></Site>} />
            <Route path="/contact" element={<Site><Contact /></Site>} />
            <Route path="/journal" element={<Site><Journal /></Site>} />
            <Route path="/journal/:slug" element={<Site><JournalArticle /></Site>} />
            <Route path="/privacy" element={<Site><Legal kind="privacy" /></Site>} />
            <Route path="/terms" element={<Site><Legal kind="terms" /></Site>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Site><NotFound /></Site>} />
          </Routes>
        </SmoothScroll>
      </BrowserRouter>
    </div>
  );
}

export default App;
