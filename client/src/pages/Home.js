import React, { useState, useEffect, useRef } from "react"
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
} from "react-router-dom"

function Home() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { name } = state
  const [userName, setuserName] = useState(name)

  console.log(19, name)

  const setDeviceFunction = (device) => {
    console.log("device: ", device)
    if (device === "controller") {
      navigate("/controller", { state: { name: "Controller" } })
    }
    if (device === "watcher") {
      navigate("/watcher", { state: { name: "Watcher" } })
    }
  }
  return (
    <div className="homeContainer">
      <h1
        className="hiUserSpan"
        style={{
          padding: "0%",
          margin: "0%",
          marginTop: "1%",
          color: "#6da0ed",
        }}
      >
        Hi, {userName}
      </h1>

      <h4
        className="headLine"
        style={{
          padding: "0%",
          margin: "0%",
          marginBottom: "1%",
          color: "#6da0ed",
        }}
      >
        SET THIS DEVICE AS:
      </h4>
      <div className="setDeviceDiv">
        <div
          className="setDevice asController"
          onClick={() => {
            setDeviceFunction("controller")
          }}
        >
          Controller
        </div>
        <div
          className="setDevice asWatcher"
          onClick={() => {
            setDeviceFunction("watcher")
          }}
        >
          Watcher
        </div>
      </div>
    </div>
  )
}

export default Home
