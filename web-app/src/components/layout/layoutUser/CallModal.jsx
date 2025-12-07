// components/chat/CallModal.jsx
import React, { useState, useEffect } from "react";
import { Phone, Video, X, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import { useCall } from "../../../contexts/CallContext.jsx";

const CallModal = () => {
  const {
    callState,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCall();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Call timer
  useEffect(() => {
    if (callState.isInCall && !callState.isRinging) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [callState.isInCall, callState.isRinging]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle mute toggle
  const handleMute = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  // Handle video toggle
  const handleVideoToggle = () => {
    const videoOff = toggleVideo();
    setIsVideoOff(videoOff);
  };

  // Don't show modal if no call
  if (!callState.isRinging && !callState.isInCall) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden">
        {/* INCOMING CALL (RINGING) */}
        {callState.isRinging && !callState.isInCall && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mb-6 animate-pulse">
              {callState.remotePeer?.firstName?.charAt(0) ||
                callState.remotePeer?.username?.charAt(0) ||
                "U"}
            </div>

            {/* Caller Info */}
            <h2 className="text-3xl font-bold text-white mb-2">
              {callState.remotePeer?.firstName} {callState.remotePeer?.lastName}
            </h2>
            <p className="text-gray-400 mb-2">
              @{callState.remotePeer?.username}
            </p>

            {/* Call Type */}
            <div className="flex items-center gap-2 text-blue-400 mb-8">
              {callState.callType === "video" ? (
                <Video className="w-5 h-5" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
              <span>
                Incoming {callState.callType === "video" ? "Video" : "Voice"}{" "}
                Call
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-6">
              {/* Reject */}
              <button
                onClick={rejectCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition shadow-lg hover:shadow-red-600/50"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>

              {/* Accept */}
              <button
                onClick={acceptCall}
                className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition shadow-lg hover:shadow-green-600/50 animate-bounce"
              >
                <Phone className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE CALL */}
        {callState.isInCall && (
          <>
            {/* Video Container */}
            <div className="flex-1 relative bg-black">
              {/* Remote Video (Full Screen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Remote Video Placeholder (if no video) */}
              {(!remoteStream || callState.callType === "voice") && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mb-4">
                    {callState.remotePeer?.firstName?.charAt(0) ||
                      callState.remotePeer?.username?.charAt(0) ||
                      "U"}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {callState.remotePeer?.firstName}{" "}
                    {callState.remotePeer?.lastName}
                  </h3>
                  <p className="text-gray-400 mt-2">
                    @{callState.remotePeer?.username}
                  </p>
                </div>
              )}

              {/* Local Video (Picture-in-Picture) */}
              {callState.callType === "video" && localStream && (
                <div className="absolute top-4 right-4 w-48 h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <VideoOff className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              )}

              {/* Call Duration */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white font-mono text-sm">
                  {formatDuration(callDuration)}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              {/* Left: Caller Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {callState.remotePeer?.firstName?.charAt(0) ||
                    callState.remotePeer?.username?.charAt(0) ||
                    "U"}
                </div>
                <div>
                  <h4 className="text-white font-semibold">
                    {callState.remotePeer?.firstName}{" "}
                    {callState.remotePeer?.lastName}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {callState.callType === "video"
                      ? "Video Call"
                      : "Voice Call"}
                  </p>
                </div>
              </div>

              {/* Center: Control Buttons */}
              <div className="flex gap-4">
                {/* Mute/Unmute */}
                <button
                  onClick={handleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                    isMuted
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </button>

                {/* End Call */}
                <button
                  onClick={endCall}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition"
                >
                  <PhoneOff className="w-6 h-6 text-white" />
                </button>

                {/* Video On/Off (only for video calls) */}
                {callState.callType === "video" && (
                  <button
                    onClick={handleVideoToggle}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                      isVideoOff
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {isVideoOff ? (
                      <VideoOff className="w-6 h-6 text-white" />
                    ) : (
                      <Video className="w-6 h-6 text-white" />
                    )}
                  </button>
                )}
              </div>

              {/* Right: Spacer */}
              <div className="w-48"></div>
            </div>
          </>
        )}
      </div>

      {/* CSS for mirror effect is handled via Tailwind or global CSS */}
      <style>
        {`
          .mirror {
            transform: scaleX(-1);
          }
        `}
      </style>
    </div>
  );
};

export default CallModal;
