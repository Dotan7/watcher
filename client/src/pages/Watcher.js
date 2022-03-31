import React, { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import url from "../url"
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
} from "react-router-dom"
import { FiPhoneCall } from "react-icons/fi"

const socket = io.connect(url + "/device")

function Watcher() {
  const { state } = useLocation()
  const [deviceType, setdeviceType] = useState(state.name)
  const [me, setMe] = useState("")
  const [stream, setStream] = useState()
  const [callAccepted, setCallAccepted] = useState(false)
  const [idToCall, setIdToCall] = useState("")
  const [callEnded, setCallEnded] = useState(false)
  const [name, setName] = useState("")
  const [waitingForRes, setWaitingForRes] = useState(false)
  const [showControllerVideo, setShowControllerVideo] = useState(true)
  const [micOnOff, setMicOnOff] = useState(true)
  const userVideo = useRef()
  const connectionRef = useRef()

  useEffect(() => {
    socket.emit(`in${deviceType}`, 123)

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream)
        // myVideo.current.srcObject = stream
      })
  }, [])

  useEffect(() => {
    socket.on("me", (id) => {
      setMe(id)
    })
    socket.on("leaveCallFromServer", (data) => {
      setCallEnded(true)
      setCallAccepted(false)
      const popDis = setTimeout(() => {
        setCallEnded(false)
        clearTimeout(popDis)
      }, 2000)
      //   connectionRef.current.destroy()
    })

    socket.on("conrollerVideoToggleFromServer", (trueOrFalse) => {
      setShowControllerVideo(trueOrFalse)
    })
    socket.on("muteThisWatcherFromServer", () => {
      setMicOnOff(!micOnOff)
    })
  }, [micOnOff])

  const callUser = (id) => {
    if (id) {
      setWaitingForRes(true)
      const peer = new window.SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream,
      })
      peer.once("signal", (data) => {
        socket.emit("callUser", {
          userToCall: id,
          signalData: data,
          from: me,
          name: name,
        })
      })
      peer.once("stream", (stream) => {
        userVideo.current.srcObject = stream
        console.log(stream)
      })
      socket.once("callAccepted", (signal) => {
        setCallAccepted(true)
        setWaitingForRes(false)
        peer.signal(signal)
      })

      connectionRef.current = peer
    } else {
      alert("Missing ID To Connect With")
    }
  }

  return (
    <div className="deviceContainer">
      <div className="headlineWatcher">{deviceType}</div>
      {callAccepted && !callEnded ? (
        <div className="videoDivAdminToWatcher">
          {!showControllerVideo && <div className="logoScreenSaverDiv"></div>}
          <video
            className="streamVideoAdminToWacher"
            playsInline
            ref={userVideo}
            autoPlay
            style={{ width: "99%" }}
          />
          {micOnOff ? <div>MIC ON</div> : <div>MIC OFF</div>}
        </div>
      ) : waitingForRes ? (
        <div className="caller">
          <h1 style={{ color: "#6da0ed" }}>Waiting For Response...</h1>
        </div>
      ) : (
        <div className="watcherStartForm">
          {callEnded && !callAccepted ? (
            <div className="disconnectPopTextDiv">
              <h5 className="disconnectPopText">Disconnected By Admin</h5>
            </div>
          ) : null}
          <input
            className="WatcherStartFormInp roomNameInputInWatcherStartForm"
            id="myNameInput"
            label="Name"
            variant="filled"
            placeholder="which room/device?"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "20px" }}
          ></input>
          <input
            className="WatcherStartFormInp"
            id="idToCallInput"
            label="ID to call"
            placeholder="ID to call"
            variant="filled"
            autoComplete="off"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          ></input>

          <button className="PhoneIconBtn" onClick={() => callUser(idToCall)}>
            <FiPhoneCall size={34} />
          </button>
        </div>
      )}
    </div>
  )
}

export default Watcher
