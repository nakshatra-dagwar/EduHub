import React from 'react';
import styles from './EduHubLogo.module.css';

interface EduHubLogoProps {
	width?: number;
	height?: number;
	className?: string;
	ariaLabel?: string;
}

// Simple SVG mark approximating the EduHub logo
// Left: green rounded square with yellow pencil mark
// Right: we render the "EDUHUB" word as text so it scales with the icon
const EduHubLogo: React.FC<EduHubLogoProps> = ({ width = 36, height = 36, className, ariaLabel = 'EduHub' }) => {
	return (
		<span className={`${styles.root} ${className || ''}`} aria-label={ariaLabel} role="img">
			<svg width={width} height={height} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" focusable="false">
				{/* Green rounded square */}
				<rect x="0" y="0" width="64" height="64" rx="12" fill="#00BC83" />
				{/* Yellow pencil base */}
				<rect x="20" y="32" width="24" height="22" rx="3" fill="#FFD900" />
				{/* Yellow pencil tip triangle (with small green notch) */}
				<path d="M32 10 L44 32 L20 32 Z" fill="#FFD900" />
				<circle cx="33" cy="22" r="2.2" fill="#00BC83" />
			</svg>
			<span className={`text-brand ${styles.word}`}>EDUHUB</span>
		</span>
	);
};

export default EduHubLogo;
