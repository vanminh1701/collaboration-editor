import { useCallback } from "react";

function useWebRTC(socket) {
  const _initialConnection = () => {
    const peerConnection = new RTCPeerConnection(iceCfg);
  };
}

export default useWebRTC;

const iceCfg = {
  iceServers: [
    {
      urls: ["turn:turn1.spiritlabs.co:3478"],
      username: "webrtc",
      credential: "webrtc",
    },
  ],
};
