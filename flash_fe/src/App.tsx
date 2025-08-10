import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChatSection } from "./pages/ChatSection";
import { ContainerSection } from "./pages/ContainerSection";
import LandingPage from "./pages/LandingPage";

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/join" element={<ChatSection />} />
          <Route path="/chat" element={<ContainerSection />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
