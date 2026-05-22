import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// ── Books ──────────────────────────────────────────────────────
export const getBooks = () => api.get("/books");
export const getBookById = (id) => api.get(`/books/${id}`);
export const createBook = (data) => api.post("/books", data);
export const updateBook = (id, data) => api.put(`/books/${id}`, data);
export const deleteBook = (id) => api.delete(`/books/${id}`);

// ── Borrowers ──────────────────────────────────────────────────
export const getBorrowers = () => api.get("/borrowers");
export const createBorrower = (data) => api.post("/borrowers", data);
export const updateBorrower = (id, data) => api.put(`/borrowers/${id}`, data);
export const deleteBorrower = (id) => api.delete(`/borrowers/${id}`);

// ── Transactions ───────────────────────────────────────────────
export const borrowBook = (data) => api.post("/borrow", data);
export const returnBook = (data) => api.post("/return", data);
export const getTransactions = () => api.get("/transactions");

// ── Search ─────────────────────────────────────────────────────
export const searchBooks = (query) => api.get("/search", { params: { q: query } });

// ── Analytics ──────────────────────────────────────────────────
export const getMostBorrowedBooks = (limit = 10) =>
  api.get("/analytics/most-borrowed-books", { params: { limit } });
export const getCategoryStats = () => api.get("/analytics/category-stats");
export const getMonthlyTrends = () => api.get("/analytics/monthly-trends");
export const getOverdueTransactions = () => api.get("/analytics/overdue-transactions");

export default api;
