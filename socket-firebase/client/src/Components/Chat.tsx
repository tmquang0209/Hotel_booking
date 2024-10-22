import { Alert, Button, Flex, Input, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ChatBoxProps {
    data: string[];
}

const ChatBox = ({ data }: ChatBoxProps) => {
    return (
        <Flex vertical className="text-center">
            <h1 className="font-bold text-2xl">Chatbox</h1>
            <div className="h-[200px] overflow-y-scroll">
                {data.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}
            </div>
        </Flex>
    );
};

function ChatComponent() {
    const [messageApi, contextHolder] = message.useMessage();
    const [messageInput, setMessageInput] = useState<string>("");
    const [room, setRoom] = useState<string>("");
    const [messages, setMessages] = useState<string[]>([]);
    const [empty, isEmpty] = useState<boolean>(false);
    const socket = useRef<Socket | null>(null);

    // Initialize the socket connection only when the component mounts
    useEffect(() => {
        socket.current = io("http://localhost:3030");

        socket.current.on("connect", () => {
            console.log("Connected to server", socket.current?.id);
        });

        socket.current.on("receive-message", (msg: string) => {
            setMessages((prev) => [...prev, msg]);
            messageApi.open({
                type: "info",
                content: "New message received!",
                duration: 3, // Duration in seconds before the message disappears
            });
        });

        // Handle socket disconnection
        socket.current.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        // Cleanup function to disconnect the socket when the component unmounts
        return () => {
            socket.current?.disconnect();
            console.log("Socket disconnected on component unmount");
        };
    }, [messageApi]);

    const btnSubmit = () => {
        if (!messageInput) {
            isEmpty(true);
            console.log(empty);
        } else {
            socket.current?.emit("send-message", messageInput, room);
            setMessages((prevMessages) => [...prevMessages, messageInput]);
            setMessageInput("");
            messageApi.open({
                type: "success",
                content: "Message sent successfully!",
                duration: 3,
            });
        }
        console.log("🚀 ~ btnSubmit ~ messages:", messages);
    };

    const joinRoomBtn = () => {
        if (room) {
            socket.current?.emit("join-room", room);
            messageApi.open({
                type: "success",
                content: `Joined to room ${room} successfully!`,
                duration: 3,
            });
        } else {
            messageApi.open({
                type: "error",
                content: "Room ID is empty",
                duration: 3,
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {contextHolder}
            <div className="w-[300px]">
                <ChatBox data={messages} />
            </div>

            <div className="w-[300px] mt-4">
                {empty && <Alert className="my-2" closable message="Message is required" type="error" showIcon />}
                <Flex align="center" className="h-10">
                    <Input
                        name="message"
                        value={messageInput}
                        onChange={(e) => {
                            setMessageInput(e.target.value);
                            isEmpty(false);
                        }}
                        placeholder="Write something..."
                        size="large"
                        allowClear
                        onPressEnter={btnSubmit}
                    />
                    <Button name="Send" className="ml-2" variant="solid" color="primary" size="large" onClick={btnSubmit}>
                        Send
                    </Button>
                </Flex>
            </div>

            <div className="w-[300px] mt-6 m-[10px]">
                <Flex>
                    <Input placeholder="Enter room id..." value={room} onChange={(e) => setRoom(e.target.value)} />
                    <Button variant="solid" color="default" className="ml-2" onClick={joinRoomBtn}>
                        Join
                    </Button>
                </Flex>
            </div>
        </div>
    );
}

export default ChatComponent;
