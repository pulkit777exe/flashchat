import { useNavigate } from "react-router-dom";

export default function LandingPage() {

    const navigate = useNavigate();

    const navigateToChat = () => {
        navigate("/join");
    };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-10 py-6 z-10 relative">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">FlashChat</span>
        </div>
      </nav>

      {/* Background Wave */}
      <div className="absolute inset-0">
        <div className="absolute w-[150%] h-[150%] -top-1/4 -left-1/4 bg-gradient-to-r from-gray-800 via-gray-700 to-black opacity-30 blur-3xl transform rotate-12"></div>
        <div className="absolute w-[150%] h-[150%] -bottom-1/4 -right-1/4 bg-gradient-to-r from-black via-gray-800 to-gray-700 opacity-40 blur-3xl transform -rotate-12"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-14 pt-40 max-w-2xl">
        <h1 className="text-5xl font-extrabold leading-tight">
          <span className="text-white">Flash Chat</span> <br />
          <span className="text-gray-400 font-bold">Chatting...</span>
        </h1>
        <p className="text-gray-400 mt-6 leading-relaxed">
          Get the power of flashchat in your own hands.
        </p>
        <button className="mt-8 px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all shadow-md hover:shadow-lg" onClick={navigateToChat}>
          Join Room
        </button>
      </div>
    </div>
  );
}
