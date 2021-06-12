import { useCallback, useEffect, useRef } from "react";

function useSocket() {
  // const [socket, setSocket] = useState();
  // const [connected, setConnected] = useState(false);
  const socket = useRef();
  const connected = useRef(false);

  const _onSend = useCallback((data) => {
    // console.log("socket_send_data", data);
    socket.current.send(JSON.stringify(data));
  }, []);

  const _onDisconnect = useCallback(() => {
    if (!connected.current) return;

    socket.current.close();
    connected.current = false;
  }, []);

  // const _onMessage = useCallback(({ data }) => {
  //   console.log("onMessage", data);
  // }, []);

  const _onClose = useCallback(() => {
    console.log("SOCKET CLOSED");
    connected.current = false;
  }, []);
  const _onOpen = useCallback(
    (socketInstance) => () => {
      console.log("connected");
      connected.current = true;
      socketInstance.send(JSON.stringify({ type: "request_init_load" }));
    },
    [],
  );

  const _onConnect = useCallback(() => {
    let socketInstance;
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      socketInstance = new WebSocket("ws://localhost:5000");
    } else {
      socketInstance = new WebSocket("he");
    }
    socket.current = socketInstance;
    // socketInstance.addEventListener("message", _onMessage, false);
    socketInstance.addEventListener("close", _onClose, false);
    socketInstance.addEventListener("open", _onOpen(socketInstance), false);
    window.socket = socketInstance;
  }, [_onClose, _onOpen]);

  useEffect(() => {
    _onConnect();

    return () => {
      _onDisconnect();
    };
  }, [_onConnect, _onDisconnect]);

  // useEffect(() => {
  //   if (connected) return;

  //   const timeout = setTimeout(() => {
  //     const socketInstance = new WebSocket("ws://localhost:5000");
  //     setSocket(socketInstance);

  //     socketInstance.addEventListener("open", _onOpen(socketInstance), false);
  //   }, 3000);

  //   return () => clearTimeout(timeout);
  // }, [_onOpen, connected]);

  return {
    socketSend: _onSend,
    connected: connected.current,
    socket: socket.current,
  };
}

export default useSocket;
