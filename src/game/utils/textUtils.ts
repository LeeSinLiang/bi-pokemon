/**
 * Text Utilities
 * Helper functions for creating sharp, high-quality text on all devices
 */

import Phaser from 'phaser';

/**
 * Create text with automatic high-DPI resolution for sharp rendering
 * Use this instead of scene.add.text() for crisp text on all devices
 *
 * Uses 2x font size + 0.5 scale technique for extra sharpness
 */
export function createSharpText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string | string[],
  style?: Phaser.Types.GameObjects.Text.TextStyle,
  doubleSize: boolean = true
): Phaser.GameObjects.Text {
  // Double the font size for sharper rendering
  let doubledStyle = { ...style };

  if (style?.fontSize) {
    // Parse fontSize (handles '24px', '24', or 24)
    const fontSizeStr = typeof style.fontSize === 'string' ? style.fontSize : String(style.fontSize);
    const fontSizeNum = parseInt(fontSizeStr, 10);

    if (!isNaN(fontSizeNum)) {
      // Double the font size
    //   const unit = fontSizeStr.includes('px') ? 'px' : '';
	  const unit = 'px'; // Always use 'px' for consistency
      doubledStyle.fontSize = `${fontSizeNum * 1}${unit}`;
    }
  }

  // Merge style with resolution set to devicePixelRatio for sharp text
  const sharpStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    ...doubledStyle,
    resolution: window.devicePixelRatio || 1,
  };

  const textObject = scene.add.text(x, y, text, sharpStyle);

  // Scale down to 0.5 to compensate for doubled font size
//   if (doubleSize) {
//     textObject.setScale(0.5);
//   }

  return textObject;
}

/**
 * Update existing text to use high-DPI resolution
 */
export function makeTextSharp(text: Phaser.GameObjects.Text): void {
  text.setResolution(window.devicePixelRatio || 1);
}
