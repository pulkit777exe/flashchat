import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatSection from './pages/ChatSection';
import ContainerSection from './pages/ContainerSection';

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
