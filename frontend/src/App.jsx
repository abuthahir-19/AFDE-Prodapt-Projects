import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Borrowers from "./pages/Borrowers";
import BorrowReturn from "./pages/BorrowReturn";
import Search from "./pages/Search";
import Analytics from "./pages/Analytics";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/borrowers" element={<Borrowers />} />
          <Route path="/borrow-return" element={<BorrowReturn />} />
          <Route path="/search" element={<Search />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
