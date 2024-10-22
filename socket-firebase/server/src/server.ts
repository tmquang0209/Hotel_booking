import { instrument } from "@socket.io/admin-ui";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = 3030;

// CORS configuration for the Express app
app.use(
    cors({
        origin: ["http://localhost:3000", "https://admin.socket.io"], // Allow your React app and admin UI to connect
        credentials: true, // Ensure cookies or authorization headers can be passed
    })
);

const httpServer = createServer(app);

// CORS configuration for Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "https://admin.socket.io"], // Allow both the frontend and admin UI
        methods: ["GET", "POST"],
        credentials: true, // Allow credentials like cookies to be sent
    },
});

// Socket.IO connection and event handling
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("send-message", (msg, room) => {
        if (room) {
            socket.broadcast.to(room).emit("receive-message", msg);
        } else {
            socket.broadcast.emit("receive-message", msg);
        }
    });

    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log("User joined room: ", roomId);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");

        // remove user from all rooms
        socket.rooms.forEach((room) => {
            socket.leave(room);
        });
    });
});

// Initialize the Socket.IO admin UI
instrument(io, {
    auth: false, // Disable authentication for simplicity
});

// Start the server
httpServer.listen(port, () => {
    console.log(`Socket.IO server is running at http://localhost:${port}`);
});
