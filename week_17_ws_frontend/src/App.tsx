import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChatSection } from "./components/ChatSection";
import { ContainerSection } from "./components/ContainerSection";

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatSection />} />
          <Route path="/chat" element={<ContainerSection />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
