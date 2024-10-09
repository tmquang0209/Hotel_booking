import { Alert, Button, Flex, Input, InputRef, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

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
    const messageInput = useRef<InputRef>(null);
    const room = useRef<InputRef>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [empty, isEmpty] = useState<boolean>(false);
    const socket = useRef(io("http://localhost:3030")).current;

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to server");
            console.log(socket.id);
        });

        socket.on("receive-message", (msg: string) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("receive-message");
        };
    }, [socket]);

    const btnSubmit = () => {
        if (messageInput.current) {
            const inbox = messageInput.current.input?.value;
            const roomId = room.current?.input?.value;
            if (!inbox) {
                isEmpty(true);
                console.log(empty);
            } else {
                socket.emit("receive-message", inbox, roomId);
                if (messageInput.current && messageInput.current.input) {
                    messageInput.current.input.value = "";
                }
                // Show a success message after sending the message
                messageApi.open({
                    type: "success",
                    content: "Message sent successfully!",
                    duration: 3, // Duration in seconds before the message disappears
                });
            }
        }
    };

    const joinRoomBtn = () => {
        const roomValue = room.current?.input?.value;

        if (roomValue) {
            socket.emit("join-room", roomValue);
            messageApi.open({
                type: "success",
                content: `Joined to room ${roomValue} successfully!`,
                duration: 3, // Duration in seconds before the message disappears
            });
        } else {
            messageApi.open({
                type: "error",
                content: "Room ID is empty",
                duration: 3, // Duration in seconds before the message disappears
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
                    <Input name="message" ref={messageInput} onFocus={() => isEmpty(false)} placeholder="Write something..." size="large" />
                    <Button name="Send" className="ml-2" variant="solid" color="primary" size="large" onClick={btnSubmit}>
                        Send
                    </Button>
                </Flex>
            </div>

            <div className="w-[300px] mt-6 m-[10px]">
                <Flex>
                    <Input placeholder="Enter room id..." ref={room} />
                    <Button variant="solid" color="default" className="ml-2" onClick={joinRoomBtn}>
                        Join
                    </Button>
                </Flex>
            </div>
        </div>
    );
}

export default ChatComponent;
