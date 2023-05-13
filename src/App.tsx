import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import styles from "./Chat.module.css";

// HERE PUT THE FRAMEWORK AI URL (e.g. http://localhost:3000)
const framework_url = "http://localhost:3000";

interface Message {
  text: string;
  isResponse: boolean;
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socket = useRef<ReturnType<typeof io>>();

  const [skinXIdInputValue, setskinXIdInputValue] = useState<string>("");
  const handleskinXIdInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setskinXIdInputValue(event.target.value);
  };

  useEffect(() => {
    // Socket connection
    socket.current = io(`${framework_url}`);
    socket.current.on('connect', () => console.log('Connected to framework AI'));
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    // Socket event listener
    // When the framework AI sends a message, add it to the messages array
    if (socket.current) {
      socket.current.on('completionText', (response: { status: number; data: { completionText: string } }) => {
        const responseMessage: Message = { text: response.data.completionText, isResponse: true };
        setMessages((prevMessages) => [...prevMessages, responseMessage]);
      });
    }
  }, [socket]);

  // Send message to framework AI
  const addMessage = (text: string) => {
    const message: Message = { text, isResponse: false };
    setMessages((prevMessages) => [...prevMessages, message]);
    if (socket.current) {
      socket.current.emit('message', skinXIdInputValue, text);
    }
  };



  const Chat = (props: { messages: Message[]; onSend: (text: string) => void }) => {
    const [inputValue, setInputValue] = useState("");
  
    const sendMessage = () => {
      if (inputValue.trim() !== "") {
        props.onSend(inputValue);
        setInputValue("");
      }
    };
  
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") sendMessage();
    };
  
    return (
      <div className={styles.chatContainer}>
        <div style={{ overflowY: "scroll", height: "400px", margin: "10px" }}>
          {props.messages.map((message, index) => (
            <div key={index} className={styles.messageContainer}>
              {message.isResponse ? (
                <>
                  <div className={`${styles.title} ${styles.aiTitle}`}>AI</div>
                  <div className={`${styles.message} ${styles.aiMessage}`}>{message.text}</div>
                </>
              ) : (
                <>
                  <div className={`${styles.title} ${styles.userTitle}`}>User</div>
                  <div className={`${styles.message} ${styles.userMessage}`}>{message.text}</div>
                </>
              )}
            </div>
          ))}
        </div>
        <input
          className={styles.inputField}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.sendButton} onClick={sendMessage}>
          Send
        </button>
      </div>
    );
  };

  return (
    <div>
      <h1>ChatGPT</h1>
      <div>
        <label htmlFor="idInput">SkinX ID:</label>
        <input
          id="idInput"
          type="text"
          value={skinXIdInputValue}
          onChange={handleskinXIdInputChange}
          placeholder="Enter SkinX ID"
        />
      </div>
      <Chat messages={messages} onSend={(text: string) => addMessage(text)} />
    </div>
  );
};

export default App;