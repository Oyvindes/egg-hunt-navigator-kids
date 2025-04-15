/**
 * Utility functions for notifications (sound and vibration)
 */

/**
 * Play a notification sound
 * @param volume Volume from 0 to 1
 */
export const playNotificationSound = (volume: number = 0.7): void => {
  try {
    // Create audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContext();
    
    // Create an oscillator for a "ping" sound
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    
    // Set volume
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    // Quick fade out
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Play for 0.5 seconds
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

/**
 * Trigger device vibration if supported
 * @param pattern Vibration pattern in milliseconds
 */
export const vibrate = (pattern: number[] = [100, 50, 100]): void => {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    console.error('Error triggering vibration:', error);
  }
};

/**
 * Trigger both sound and vibration for a notification
 */
export const triggerNotification = (): void => {
  playNotificationSound();
  vibrate();
};