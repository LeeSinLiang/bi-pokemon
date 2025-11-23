import React from 'react';
import roomBg from '../assets/room_bg.jpeg';

import { Pencil } from 'lucide-react';

const RoomView: React.FC = () => {
	return (
		<div className="absolute inset-0 w-full h-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${roomBg})` }}>
			{/* Placeholder for room items if we had them */}
			<div className="absolute bottom-24 right-4">
				<button className="bg-[#FFCC80] text-[#5D4037] font-bold py-2 px-6 rounded-xl border-b-4 border-[#FFA726] shadow-sm active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2">
					<Pencil size={16} /> Edit Room
				</button>
			</div>
		</div>
	);
};

export default RoomView;
