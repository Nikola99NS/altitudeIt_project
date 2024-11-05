import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

function App() {
  return (
    <Router>
      <div className="text-center bg-blue-500 text-white p-4">
        <h1 className="text-2xl font-bold">Welcome to my App!</h1>
        <Link to="/register" className="text-blue-300 hover:underline">Registruj se</Link>
      </div>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;