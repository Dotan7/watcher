const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const socket = require("socket.io")
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    // origin: "https://dot-watcher.herokuapp.com",
    methods: ["GET", "POST"],
  },
})
const cors = require("cors")
const path = require("path")

app.use(cors())

const controller = io.of("/controller")
const watcher = io.of("/watcher")
const device = io.of("/device")

global.rooms = {}

device.on("connection", (socket) => {
  socket.on("inController", () => {
    socket.emit("me", socket.id)
    console.log("me", socket.id)
  })

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded")
  })

  socket.on("inWatcher", () => {
    socket.emit("me", socket.id)
    console.log("me", socket.id)
  })

  socket.on("callUser", (data) => {
    socket.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    })
  })

  socket.on("answerCall", (data) => {
    socket.to(data.to).emit("callAccepted", data.signal)
  })

  socket.on("leaveCall", (caller) => {
    console.log(caller)
    socket.to(caller).emit("leaveCallFromServer")
  })

  socket.on("conrollerVideoToggle", (trueOrFalse, caller) => {
    console.log(trueOrFalse, caller)
    socket.to(caller).emit("conrollerVideoToggleFromServer", trueOrFalse)
  })

  socket.on("muteThisWatcher", (caller) => {
    console.log(caller)
    socket.to(caller).emit("muteThisWatcherFromServer")
  })
})

if (process.env.PROD) {
  app.use(express.static(path.join(__dirname, "./client/build")))
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"))
  })
}

// listener
const PORT = process.env.PORT || 2020

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
})
