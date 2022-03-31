import "./App.css"
import React, { useState, useEffect, useRef } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom"

import WelcomePage from "./pages/WelcomePage"
import Home from "./pages/Home"
// import Device from "./pages/Device"
import Controller from "./pages/Controller"
import Watcher from "./pages/Watcher"

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="home" element={<Home />} />
          <Route path="Controller" element={<Controller />} />
          <Route path="Watcher" element={<Watcher />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
