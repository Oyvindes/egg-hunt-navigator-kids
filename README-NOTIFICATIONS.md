# Easter Egg Hunt Notification System

This document explains the notification system implemented in the Easter Egg Hunt Navigator application. The system uses multiple notification methods to keep administrators and participants informed.

## Notification Types

The application uses three types of notifications:

1. **Sound Notifications**
   - Audible alert tones using the Web Audio API
   - Volume control options
   - Different sounds for different events

2. **Vibration Notifications**
   - Device vibration using the Vibration API
   - Pattern-based vibration for different alerts
   - Works on mobile devices that support vibration

3. **Push Notifications**
   - Browser push notifications that appear even when the app is in the background
   - Permission-based (requires user consent)
   - Custom icons, titles, and messages
   - Auto-dismissal after 5 seconds

## When Notifications Are Triggered

### For Administrators:

1. **New Photo Submission**
   - Push notification when a participant submits a new photo for approval
   - Sound alert plays
   - Visual notification in the admin panel
   - Shows the participant's name (if available)

2. **Approval/Rejection Actions**
   - Notification when approving or rejecting photos
   - Includes waypoint name in notification
   - Confirmations of action success

### For Participants:

1. **Photo Submission Results**
   - Visual confirmation when photo is submitted
   - Future feature: Push notification when photo is approved/rejected

## Technical Implementation

### Permission Model

The application follows best practices for requesting notification permissions:

1. **Explicit Permission Request**
   - Users are prompted to allow notifications
   - Clear explanation of notification purpose
   - Non-invasive permission flow

2. **Graceful Degradation**
   - Falls back to in-app notifications if push notifications are declined
   - Still provides sound and vibration feedback if allowed

### Notification Service

The notification service provides these key functions:

```typescript
// Request permission for browser notifications
requestNotificationPermission(): Promise<NotificationPermission>

// Check if notifications are available and permitted
canShowNotifications(): boolean

// Play notification sound
playNotificationSound(volume?: number): void

// Trigger device vibration
vibrate(pattern?: number[]): void

// Combined notification (sound, vibration, and push if permitted)
triggerNotification(title?: string, options?: NotificationOptions): void

// Show photo submission notification
showPhotoSubmissionNotification(displayName?: string): void
```

## Integration Points

The notification system is integrated at these key points:

1. **PhotoSubmit Component**
   - Requests notification permission on mount
   - Sends notification when photo is submitted

2. **PhotoApproval Component**
   - Requests notification permission on mount
   - Shows notification for new submissions
   - Sends notifications when approving/rejecting photos

3. **Admin Dashboard**
   - Toggle for enabling/disabling sound notifications
   - Handles notification permission requests

## Future Enhancements

Planned notification enhancements:

1. **Real-time Notifications**
   - Implement WebSocket or Supabase Realtime for instant notifications
   - Remove polling-based approach

2. **More Notification Events**
   - Notify when participants reach certain waypoints
   - Completion notifications for entire hunt
   - Time-based reminders

3. **Custom Sounds**
   - Allow custom sound selection
   - Different sounds for different event types

4. **Service Worker Support**
   - Enable true background notifications
   - Work even when browser is closed