import React, { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import url from "../url"
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
} from "react-router-dom"
import { MdContentCopy } from "react-icons/md"
import { FcEndCall } from "react-icons/fc"
import { FiPhoneCall } from "react-icons/fi"
import { VscAccount } from "react-icons/vsc"
import { BiFullscreen, BiExitFullscreen } from "react-icons/bi"
import {
  BsMic,
  BsMicMute,
  BsCameraVideo,
  BsCameraVideoOff,
  BsEyeFill,
} from "react-icons/bs"

const socket = io.connect(url + "/device")

function Controller() {
  const { state } = useLocation()
  const [deviceType, setdeviceType] = useState(state.name)
  const [me, setMe] = useState("")
  const [stream, setStream] = useState()
  const [receivingCall, setReceivingCall] = useState(false) /////
  const [caller, setCaller] = useState("")
  const [callerSignal, setCallerSignal] = useState()
  const [callAccepted, setCallAccepted] = useState(false) ////
  const [callEnded, setCallEnded] = useState(false) /////
  const [name, setName] = useState("")
  const [copyLinkText, setCopyLinkText] = useState("Copy Link")
  const [micOnOff, setMicOnOff] = useState(true)
  const [videoOnOff, setVideoOnOff] = useState(true)
  const [fullScreen, setFullScreen] = useState(false)
  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()

  useEffect(() => {
    console.log(stream)
  }, [stream])

  useEffect(() => {
    socket.emit(`in${deviceType}`, 123)

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream)
        myVideo.current.srcObject = stream
      })

    socket.on("me", (id) => {
      setMe(id)
    })

    socket.on("callUser", (data) => {
      setReceivingCall(true)
      setCaller(data.from)
      setName(data.name)
      setCallerSignal(data.signal)
    })
  }, [])

  const answerCall = () => {
    setCallAccepted(true)
    setReceivingCall(false)
    const peer = new window.SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream,
    })
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller })
    })
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream
    })

    peer.signal(callerSignal)
    connectionRef.current = peer
    console.log("peer: ", peer)
  }

  const leaveCall = () => {
    setCallEnded(true)
    setCallAccepted(false)
    connectionRef.current.destroy()
    socket.emit("leaveCall", caller)
    const endCallTimeOut = setTimeout(() => {
      setCallEnded(false)
      clearTimeout(endCallTimeOut)
    }, 2000)
  }

  const copyText = () => {
    navigator.clipboard.writeText(me)
    setCopyLinkText("Copied!")
    const gone = setTimeout(() => {
      setCopyLinkText("Copy Link")
      clearTimeout(gone)
    }, 1000)
  }

  const toggleMicrophon = () => {
    console.log("toggleMicrophon")

    if (micOnOff) {
      stream.getAudioTracks()[0].enabled = false
    } else {
      stream.getAudioTracks()[0].enabled = true
    }

    setMicOnOff(!micOnOff)
  }

  const toggleVideo = () => {
    if (videoOnOff) {
      stream.getVideoTracks()[0].enabled = false
      socket.emit("conrollerVideoToggle", false, caller)
    } else {
      stream.getVideoTracks()[0].enabled = true
      socket.emit("conrollerVideoToggle", true, caller)
    }
    setVideoOnOff(!videoOnOff)
  }
  const toggleFullScreen = () => {
    setFullScreen(!fullScreen)
  }
  const muteThisWatcher = () => {
    socket.emit("muteThisWatcher", caller)
  }

  return (
    <div className="deviceContainer">
      <div className="headline">
        <div className="accountDiv" style={{ width: "33%" }}>
          <VscAccount size={24} />
        </div>
        <div className="deviceTypeDiv" style={{ width: "33%" }}>
          {deviceType}
        </div>
        <div className="copyBtnDiv" style={{ width: "33%" }}>
          <span className="idSpan">My ID: {me} </span>

          <MdContentCopy
            className="copyBtnIcon"
            size={24}
            onClick={() => {
              copyText()
            }}
          />
          <span className="copyBtnTag">{copyLinkText}</span>
        </div>
      </div>

      <div className="videoDiv">
        {!videoOnOff && <div className="logoScreenSaverDiv"></div>}
        {stream ? (
          <video
            className="streamVideoAdminToAdmin"
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={{ width: "99%" }}
          />
        ) : null}
      </div>
      <div className="videoDivLine">
        {callAccepted && !callEnded ? (
          <div
            className="watcherVideo"
            style={{
              width: fullScreen ? "100%" : "30%",
              height: fullScreen ? "100%" : null,
              position: fullScreen ? "absolute" : "relative",
              top: fullScreen ? "0px" : null,
              left: fullScreen ? "0px" : null,
            }}
          >
            <video
              className="streamVideoWacherToAdmin"
              playsInline
              ref={userVideo}
              autoPlay
            />
            <div
              className="onWatcherBtnsDiv"
              style={{ bottom: fullScreen ? "8%" : "1%" }}
            >
              <FcEndCall
                className="onWatcherBtns"
                size={"90%"}
                onClick={() => {
                  leaveCall()
                }}
              />

              {micOnOff ? (
                <BsMic
                  className="onWatcherBtns"
                  size={"90%"}
                  onClick={() => {
                    muteThisWatcher()
                  }}
                />
              ) : (
                <BsMicMute
                  className="onWatcherBtns"
                  size={"90%"}
                  style={{ backgroundColor: "#eb3f3f" }}
                  onClick={() => {
                    muteThisWatcher()
                  }}
                />
              )}

              {!fullScreen ? (
                <BiFullscreen
                  className="onWatcherBtns"
                  size={"90%"}
                  onClick={() => {
                    toggleFullScreen()
                  }}
                />
              ) : (
                <BiExitFullscreen
                  className="onWatcherBtns"
                  size={"90%"}
                  onClick={() => {
                    toggleFullScreen()
                  }}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>

      {receivingCall && !callAccepted ? (
        <div className="caller">
          <h1 style={{ color: "#6da0ed" }}>Loging attempt from {name}</h1>
          <button
            className="PhoneIconBtn"
            variant="contained"
            onClick={answerCall}
          >
            <FiPhoneCall size={34} className="phoneLogoToAnswer" />
          </button>
        </div>
      ) : null}

      {callAccepted && !callEnded ? (
        <div className="bottomActionsLine">
          <FcEndCall
            className="bottomLineActionsBtns"
            size={"90%"}
            onClick={() => {
              leaveCall()
            }}
          />

          {micOnOff ? (
            <BsMic
              className="bottomLineActionsBtns"
              size={"90%"}
              onClick={() => {
                toggleMicrophon()
              }}
            />
          ) : (
            <BsMicMute
              className="bottomLineActionsBtns"
              size={"90%"}
              style={{ backgroundColor: "#eb3f3f" }}
              onClick={() => {
                toggleMicrophon()
              }}
            />
          )}

          {videoOnOff ? (
            <BsCameraVideo
              className="bottomLineActionsBtns"
              size={"90%"}
              onClick={() => {
                toggleVideo()
              }}
            />
          ) : (
            <BsCameraVideoOff
              className="bottomLineActionsBtns"
              size={"90%"}
              style={{ backgroundColor: "#eb3f3f" }}
              onClick={() => {
                toggleVideo()
              }}
            />
          )}
        </div>
      ) : null}
    </div>
  )
}

export default Controller
