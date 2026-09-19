/**
 * Silent sound notifier per user request: "알림은 소리는 안내줘도 돼."
 * Sound playback is completely disabled.
 * Instead, gentle visual feedback and optional mobile vibration can be used.
 */
class SoundNotifier {
  private isMuted: boolean = true;

  public setMuted(_muted: boolean) {
    this.isMuted = true;
  }

  public getMuted(): boolean {
    return true;
  }

  /**
   * Sound is disabled per user preference.
   * Optionally triggers gentle mobile haptic feedback if supported.
   */
  public playChime() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([80, 50, 80]);
      } catch {
        // Ignore haptic errors on unsupported devices
      }
    }
  }

  /**
   * Completion feedback (silent haptic)
   */
  public playSuccess() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(60);
      } catch {
        // Ignore haptic errors on unsupported devices
      }
    }
  }
}

export const soundNotifier = new SoundNotifier();
