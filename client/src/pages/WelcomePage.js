import React, { useState, useEffect, useRef } from "react"
import { BrowserRouter as Router, useNavigate } from "react-router-dom"

function WelcomePage() {
  const navigate = useNavigate()

  const ContinueAsGuestFunction = () => {
    console.log("ContinueAsGuestFunction click")
    navigate("/home", { state: { name: "Guest" } })
  }
  return (
    <div className="WelcomePageContainer">
      <h1
        className="headlineWelcomeDiv"
        style={{
          padding: "0%",
          margin: "0%",
          marginTop: "1%",
          color: "#6da0ed",
        }}
      >
        Welcome To Watcher
      </h1>
      <h4
        className="horaot"
        style={{
          padding: "0%",
          margin: "0%",
          marginBottom: "1%",
          color: "#6da0ed",
        }}
      >
        Online tool for watching
      </h4>
      <div className="welcomeBtnsDivs loginBtnDiv">
        <button className="welcomeBtns">Login</button>
      </div>
      <div className="welcomeBtnsDivs guestBtnDiv">
        <button
          className="welcomeBtns"
          onClick={() => {
            ContinueAsGuestFunction()
          }}
        >
          Continue as guest
        </button>
      </div>
      <div className="welcomeBtnsDivs SignUpBtnDiv">
        <button className="welcomeBtns">Don't have an account? Sign Up</button>
      </div>
    </div>
  )
}

export default WelcomePage
