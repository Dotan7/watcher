import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import url from "../url";
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { MdContentCopy } from "react-icons/md";
import { FcEndCall } from "react-icons/fc";
import { FiPhoneCall } from "react-icons/fi";
import { VscAccount } from "react-icons/vsc";
import {
  BsMic,
  BsMicMute,
  BsCameraVideo,
  BsCameraVideoOff,
  BsEyeFill,
} from "react-icons/bs";

const socket = io.connect(url + "/device");

function Device() {
  const { state } = useLocation();
  const [deviceType, setdeviceType] = useState(state.name);
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [copyLinkText, setCopyLinkText] = useState("Copy Link");
  const [micOnOff, setMicOnOff] = useState(true);
  const [videoOnOff, setVideoOnOff] = useState(true);
  const [waitingForRes, setWaitingForRes] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    socket.emit(`in${deviceType}`, 123);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on("leaveCallFromServer", (data) => {
      setCallEnded(true);
      connectionRef.current.destroy();
    });
  }, []);

  const callUser = (id) => {
    if (id) {
      setWaitingForRes(true);
      const peer = new window.SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream,
      });
      peer.on("signal", (data) => {
        socket.emit("callUser", {
          userToCall: id,
          signalData: data,
          from: me,
          name: name,
        });
      });
      peer.on("stream", (stream) => {
        userVideo.current.srcObject = stream;
      });
      socket.on("callAccepted", (signal) => {
        setCallAccepted(true);
        setWaitingForRes(false);
        peer.signal(signal);
      });

      connectionRef.current = peer;
    } else {
      alert("Missing ID To Connect With");
    }
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new window.SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
    console.log("peer: ", peer);
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    socket.emit("leaveCall", caller);
  };

  const copyText = () => {
    navigator.clipboard.writeText(me);
    setCopyLinkText("Copied!");
    const gone = setTimeout(() => {
      setCopyLinkText("Copy Link");
      clearTimeout(gone);
    }, 1000);
  };

  const toggleMicrophon = () => {
    console.log("toggleMicrophon");

    if (micOnOff) {
      stream.getAudioTracks()[0].enabled = false;
    } else {
      stream.getAudioTracks()[0].enabled = true;
    }

    setMicOnOff(!micOnOff);
  };

  const toggleVideo = () => {
    if (videoOnOff) {
      stream.getVideoTracks()[0].enabled = false;
    } else {
      stream.getVideoTracks()[0].enabled = true;
    }
    setVideoOnOff(!videoOnOff);
  };

  if (deviceType === "Controller") {
    ///// ---------- Controller screen ---------- /////
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
                copyText();
              }}
            />
            <span className="copyBtnTag">{copyLinkText}</span>
          </div>
        </div>

        <div className="videoDiv">
          {stream && (
            <video
              className="streamVideoAdminToAdmin"
              playsInline
              muted
              ref={myVideo}
              autoPlay
              style={{ width: "200px" }}
            />
          )}
        </div>
        <br></br>
        <div className="videoDivLine">
          {callAccepted && !callEnded ? (
            <video
              className="streamVideoWacherToAdmin"
              playsInline
              ref={userVideo}
              autoPlay
              style={{ width: "25%" }}
            />
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

        <div className="bottomActionsLine">
          {callAccepted && !callEnded ? (
            <FcEndCall
              className="bottomLineActionsBtns"
              size={"90%"}
              onClick={() => {
                leaveCall();
              }}
            />
          ) : null}

          {callAccepted && !callEnded ? (
            micOnOff ? (
              <BsMic
                className="bottomLineActionsBtns"
                size={"90%"}
                onClick={() => {
                  toggleMicrophon();
                }}
              />
            ) : (
              <BsMicMute
                className="bottomLineActionsBtns"
                size={"90%"}
                style={{ backgroundColor: "#eb3f3f" }}
                onClick={() => {
                  toggleMicrophon();
                }}
              />
            )
          ) : null}

          {callAccepted && !callEnded ? (
            videoOnOff ? (
              <BsCameraVideo
                className="bottomLineActionsBtns"
                size={"90%"}
                onClick={() => {
                  toggleVideo();
                }}
              />
            ) : (
              <BsCameraVideoOff
                className="bottomLineActionsBtns"
                size={"90%"}
                style={{ backgroundColor: "#eb3f3f" }}
                onClick={() => {
                  toggleVideo();
                }}
              />
            )
          ) : null}
        </div>
      </div>
    );
  } else {
    ///// ---------- Watcher screen ---------- /////
    return (
      <div className="deviceContainer">
        <div className="headlineWatcher">{deviceType}</div>

        <div className="">
          {stream && (
            <video
              className="streamVideoWacherToWacher"
              // playsInline
              // muted
              ref={myVideo}
              // autoPlay
              style={{ width: "0px", display: "none" }}
            />
          )}
        </div>
        <br></br>
        <div className="videoDivAdminToWatcher">
          {callAccepted && !callEnded ? (
            <video
              className="streamVideoAdminToWacher"
              playsInline
              ref={userVideo}
              autoPlay
              style={{ width: "100%" }}
            />
          ) : null}
        </div>
        {callAccepted && !callEnded ? null : waitingForRes ? (
          <div className="caller">
            <h1 style={{ color: "#6da0ed" }}>Waiting For Response...</h1>
          </div>
        ) : (
          <div className="watcherStartForm">
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
    );
  }
}

export default Device;
