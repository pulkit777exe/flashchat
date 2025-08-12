import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const navigateToChat = () => {
    navigate("/join");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-6 z-10 relative">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">
            FlashChat
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
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
          <div className="absolute top-20 left-20 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-grey-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-6 md:px-14 pt-20 md:pt-32 max-w-4xl mx-auto text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center px-4 py-2 bg-gray-600/10 border border-gray-600/20 rounded-full text-white text-sm font-medium">
            ✨ Real-time messaging made simple
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-400 to-gray-300 bg-clip-text text-transparent">
              Flash
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-600 via-white to-gray-500 bg-clip-text text-transparent">
              Chat
            </span>
          </h1>
          
          <p className="text-gray-400 text-md md:text-lg max-w-2xl mx-auto leading-relaxed">
            Connect instantly with temporary chat rooms. No accounts, no hassle. 
            Just create a room and start chatting with anyone, anywhere.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button 
              onClick={navigateToChat}
              className="group relative px-8 py-4 bg-white rounded-full font-bold text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102 hover:-translate-y-1"
            >
              <span className="relative z-10 text-black">Start Chatting Now</span>
              <div className="absolute inset-0 bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
            </button>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>No Login required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 px-6 pt-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "⚡",
              title: "Instant Setup",
              description: "Create or join rooms in seconds"
            },
            {
              icon: "🔒",
              title: "Private & Secure",
              description: "Your conversations are temporary and private"
            },
            {
              icon: "🌐",
              title: "Cross Platform",
              description: "Works on any device with a web browser"
            }
          ].map((feature, index) => (
            <div key={index} className="group p-6 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:bg-gray-800/50 transition-all duration-300">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
