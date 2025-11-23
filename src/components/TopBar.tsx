import React from 'react';
import { Crown, Ticket, Plus } from 'lucide-react';

const TopBar: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none font-display">
      {/* Avatar */}
      <div className="w-16 h-16 bg-[#E0C3A1] rounded-full border-2 border-[#8D6E63] overflow-hidden shadow-md pointer-events-auto relative">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Placeholder for cat in bag */}
          <span className="text-3xl">🐱</span>
        </div>
      </div>

      {/* Currency */}
      <div className="flex flex-col gap-2 pointer-events-auto items-end">
        {/* Coins */}
        <div className="flex items-center bg-[#FFF8E7] rounded-full pl-1 pr-1 py-0.5 border-2 border-[#E0E0E0] shadow-sm h-8 min-w-[100px] justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-[#FFD54F] border border-[#FFB300] flex items-center justify-center text-xs mr-1 text-white">
              <Crown size={14} strokeWidth={3} />
            </div>
            <span className="font-bold text-[#5D4037] text-sm">31</span>
          </div>
          <button className="w-5 h-5 bg-[#81C784] text-white rounded-full flex items-center justify-center hover:bg-[#66BB6A] transition-colors ml-2">
            <Plus size={14} strokeWidth={4} />
          </button>
        </div>

        {/* Tickets */}
        <div className="flex items-center bg-[#FFF8E7] rounded-full pl-1 pr-1 py-0.5 border-2 border-[#E0E0E0] shadow-sm h-8 min-w-[100px] justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-[#64B5F6] border border-[#42A5F5] flex items-center justify-center text-xs mr-1 text-white">
              <Ticket size={14} strokeWidth={3} />
            </div>
            <span className="font-bold text-[#5D4037] text-sm">3</span>
          </div>
          <button className="w-5 h-5 bg-[#81C784] text-white rounded-full flex items-center justify-center hover:bg-[#66BB6A] transition-colors ml-2">
            <Plus size={14} strokeWidth={4} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
