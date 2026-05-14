import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SubmitFeedback from './pages/SubmitFeedback';
import FeedbackList from './pages/FeedbackList';
import FeedbackDetail from './pages/FeedbackDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/submit" element={<SubmitFeedback />} />
            <Route path="/feedback" element={<FeedbackList />} />
            <Route path="/feedback/:id" element={<FeedbackDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
