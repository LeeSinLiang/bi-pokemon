import { useState } from 'react';
import TopBar from './components/TopBar';
import RoomView from './components/RoomView';
import BottomNav from './components/BottomNav';

function App() {
  const [activeTab, setActiveTab] = useState<string>('camera');

  return (
    <div className="relative w-full h-full bg-primary-bg overflow-hidden flex flex-col items-center justify-center bg-gray-900">
      {/* Phone Container */}
      <div className="relative w-full max-w-[400px] h-full max-h-[850px] bg-[#FDF6E3] flex flex-col shadow-2xl overflow-hidden">
        {/* Main Game Area */}
        <div className="flex-1 relative overflow-hidden">
          <RoomView />
          <TopBar />
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
