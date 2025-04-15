/**
 * Utility functions for notifications (sound, vibration, and push notifications)
 */

// Variable to track if we have notification permission
let notificationPermission: NotificationPermission = 'default';

/**
 * Request permission to show browser notifications
 * @returns Promise resolving to the permission state
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }

  // Check if permission is already granted
  if (Notification.permission === 'granted') {
    notificationPermission = 'granted';
    return 'granted';
  }

  // Ask for permission
  try {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Check if notifications are supported and permitted
 */
export const canShowNotifications = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted';
};

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
export const triggerNotification = (title?: string, options?: NotificationOptions): void => {
  // Play sound and vibrate
  playNotificationSound();
  vibrate();
  
  // Show browser notification if permission granted
  if (canShowNotifications() && title) {
    try {
      const notification = new Notification(title, options);
      
      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      // Handle click event
      notification.onclick = function() {
        window.focus();
        this.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
};

/**
 * Show a notification for a new photo submission
 * @param displayName Optional name of submitter
 */
export const showPhotoSubmissionNotification = (displayName?: string): void => {
  const title = 'New Photo Submission';
  
  triggerNotification(title, {
    body: displayName
      ? `${displayName} has submitted a new photo for approval!`
      : 'A new photo has been submitted for approval!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'photo-submission'
  });
};