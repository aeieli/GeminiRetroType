/**
 * Generates a CSS clip-path polygon string representing a jagged edge.
 * Can target 'bottom', 'top', or 'both'.
 */
export const generateJaggedEdge = (seed: number, side: 'bottom' | 'top' | 'both' = 'bottom'): string => {
  const steps = 20; // Number of "teeth"
  const stepWidth = 100 / steps;
  let points: string[] = [];

  // 1. Start Top Left
  if (side === 'bottom') {
    points.push("0% 0%");
    points.push("100% 0%");
  } else {
    // Generate jagged Top from Left to Right
    points.push("0% 0%"); // Anchor
    for (let i = 0; i <= steps; i++) {
      const x = i * stepWidth;
      const variance = Math.random() * 4; 
      const y = variance; 
      points.push(`${x}% ${y}%`);
    }
  }

  // 2. Right side down
  points.push("100% 100%");

  // 3. Bottom Edge
  if (side === 'top') {
     points.push("0% 100%");
  } else {
    // Generate jagged Bottom from Right to Left
    for (let i = 0; i < steps; i++) {
        const x = 100 - (i * stepWidth) - (stepWidth / 2);
        const variance = Math.random() * 5 + 2; // 2% to 7% variance
        const y = 100 - variance; 
        points.push(`${x}% ${y}%`);
        points.push(`${100 - ((i + 1) * stepWidth)}% 100%`);
    }
    points.push("0% 100%");
  }

  return `polygon(${points.join(', ')})`;
};

export const getRandomRotation = () => {
  return Math.random() * 6 - 3; // -3 to +3 degrees
};

export const getRandomPosition = (containerWidth: number, containerHeight: number) => {
  // Randomly place in the top 50% of the screen
  const x = Math.random() * (containerWidth - 280); // subtract width of sticker roughly
  const y = Math.random() * (containerHeight * 0.4);
  return { x, y };
};