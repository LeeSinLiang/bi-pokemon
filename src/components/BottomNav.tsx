import React from 'react';
import { Camera } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab: _activeTab, setActiveTab }) => {
	const navItems = [
		{ id: 'history', label: 'History', icon: '/assets/History icon.png' },
		{ id: 'dungeon', label: 'Game', icon: '/assets/Game Icon.png' },
		{ id: 'camera', label: 'Camera', isMain: true },
		{ id: 'character', label: 'Character', icon: '/assets/Character icon.png' },
		{ id: 'shop', label: 'Shop', icon: '/assets/Shop icon.png' },
	];

	const handleNavClick = (id: string) => {
		setActiveTab(id);
		if (id === 'dungeon') {
			alert("Hello World");
		}
	};

	return (
		<div className="relative z-20 flex items-end h-20 bg-nav-bg">
			{/* Dashed Border Top */}
			{/* <div className="absolute top-0 left-0 w-full h-[2px] border-t-2 border-dashed border-[#D7CCC8]"></div> */}

			{navItems.map((item) => (
				<button
					key={item.id}
					onClick={() => handleNavClick(item.id)}
					className="relative flex items-center justify-center flex-1 p-0 m-0 transition-all duration-200 border-none outline-none"
				>
					{item.isMain ? (
						// Camera button with custom background and label
						<div className="relative flex items-center justify-center w-full h-full">
							<img
								src="/assets/Main Camera background.png"
								alt="Camera background"
								className="object-cover w-full h-full"
							/>
							<div className="absolute z-10 flex flex-col items-center justify-center gap-0.5">
								<Camera
									className="text-white"
									size={40}
									strokeWidth={2}
								/>
								<span className="text-white font-bold text-[10px]">
									Camera
								</span>
							</div>
						</div>
					) : (
						// Regular icon button - fill entire button space
						<img
							src={item.icon}
							alt={item.label}
							className="object-cover w-full h-full"
						/>
					)}

					{/* Label - hidden for regular buttons since icons have labels */}
					{!item.isMain && (
						<span className="sr-only">
							{item.label}
						</span>
					)}
				</button>
			))}
		</div>
	);
};

export default BottomNav;
