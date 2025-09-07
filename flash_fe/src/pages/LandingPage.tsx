import { useNavigate } from "react-router-dom";
import { useResetRecoilState } from "recoil";
import { MessagesAtom, TypingUsersAtom, ConnectionStatusAtom, WebSocketAtom } from "../store/atoms";

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Reset all chat-related state when landing on this page
  const resetMessages = useResetRecoilState(MessagesAtom);
  const resetTypingUsers = useResetRecoilState(TypingUsersAtom);
  const resetConnectionStatus = useResetRecoilState(ConnectionStatusAtom);
  const resetWebSocket = useResetRecoilState(WebSocketAtom);

  const navigateToChat = () => {
    // Reset all state before navigating
    resetMessages();
    resetTypingUsers();
    resetConnectionStatus();
    resetWebSocket();
    
    navigate("/join");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-silver text-white relative overflow-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-6 z-10 relative">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">
            FlashChat
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <span>Real-time messaging</span>
          <span>•</span>
          <span>Temporary rooms</span>
          <span>•</span>
          <span>No Login/SignUp</span>
        </div>
      </nav>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full">
          {/* Animated gradient blobs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-silver/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-72 h-72 bg-silver/15 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-4000"></div>
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-6 md:px-14 pt-20 md:pt-32 max-w-4xl mx-auto text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center px-4 py-2 bg-silver/10 border border-silver/20 rounded-full text-white text-sm font-medium">
            ✨ Real-time messaging made simple
          </div>
          
          <h1 className="text-6xl md:text-6xl lg:text-7xl font-black leading-tight">
            <span className="bg-gradient-to-r from-white via-silver to-gray-300 bg-clip-text text-transparent">
              Flash
            </span>
            <br />
            <span className="text-white">Chat</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Connect with others in real-time. Create temporary rooms instantly – no sign-up required. 
            Just choose a room, pick a name, and start chatting.
          </p>
          
          <div className="flex justify-center pt-6">
            <button
              onClick={navigateToChat}
              className="group inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-silver transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Chatting
              <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 md:px-14 pt-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl bg-black/50 backdrop-blur-sm border border-silver/20">
            <div className="w-12 h-12 bg-silver/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              ⚡
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Lightning Fast</h3>
            <p className="text-gray-300">Messages appear instantly with real-time WebSocket connections</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-black/50 backdrop-blur-sm border border-silver/20">
            <div className="w-12 h-12 bg-silver/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              🔒
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Privacy First</h3>
            <p className="text-gray-300">Temporary rooms that disappear when everyone leaves</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-black/50 backdrop-blur-sm border border-silver/20">
            <div className="w-12 h-12 bg-silver/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              ✨
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">No Setup</h3>
            <p className="text-gray-300">Jump in immediately – no accounts, no downloads, no hassle</p>
          </div>
        </div>
      </div>
    </div>
  );
}
