import confetti from 'canvas-confetti';

export function firePraiseConfetti() {
  try {
    // Heart & soft warm colors celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#ec4899', '#fb7185', '#fbbf24', '#a855f7']
    });
  } catch (e) {
    console.log('Confetti error:', e);
  }
}

export function fireCompletionConfetti() {
  try {
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
    });
  } catch (e) {
    console.log('Confetti error:', e);
  }
}
