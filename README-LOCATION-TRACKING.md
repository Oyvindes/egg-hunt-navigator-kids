# Easter Egg Hunt Location Tracking System

This document explains the location tracking system implemented in the Easter Egg Hunt Navigator application. The system is designed to respect user privacy while providing helpful features for both hunters and administrators.

## Key Features

1. **Real-time Location Tracking**
   - Uses browser geolocation API to track egg hunters in real-time
   - Sends location updates to the Supabase database every 30 seconds
   - Tracks accuracy, timestamp, and last visited waypoint

2. **Privacy Consent Framework**
   - Requires explicit user consent before sharing location data
   - Provides clear explanations of how location data is used
   - Allows users to decline location sharing
   - Uses secure, temporary identifiers rather than real names
   - Automatically deletes old location data (24-hour retention policy)

3. **Admin Live Map**
   - Displays all active egg hunters on a single map for administrators
   - Shows user positions, accuracy, and recent activity
   - Updates automatically every 10 seconds 
   - Works using either database (persistent) or in-memory (temporary) data

## Technical Implementation

### Database Structure

The location tracking uses a `user_locations` table with the following schema:

```sql
CREATE TABLE user_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    hunt_id UUID NOT NULL REFERENCES hunts(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    display_name TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_waypoint TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Privacy and Security Measures

1. **Row-Level Security** - Ensures only authorized users can read/write location data
2. **Auto-Deletion** - Old location data gets automatically deleted after 24 hours
3. **Consent Management** - Stores consent in localStorage and checks before tracking
4. **Transparency** - Clear explanations of data usage in the consent dialog
5. **Anonymous Identifiers** - Uses random names rather than personal identifiers

### Sequence Diagram

```
┌─────────┐          ┌──────────┐          ┌──────────┐
│  Hunter │          │ Database │          │  Admin   │
└────┬────┘          └────┬─────┘          └────┬─────┘
     │                    │                     │
     │ Request consent    │                     │
     ├───────────────────>│                     │
     │                    │                     │
     │ If consented       │                     │
     │ Start tracking     │                     │
     │                    │                     │
     │ Send location      │                     │
     │ every 30 seconds   │                     │
     ├───────────────────>│                     │
     │                    │                     │
     │                    │                     │
     │                    │  Request locations  │
     │                    │<────────────────────┤
     │                    │                     │
     │                    │  Return locations   │
     │                    │─────────────────────┤
     │                    │                     │
     │                    │  Display on map     │
     │                    │                     │
```

## How to Use

### For Administrators

1. Navigate to the Admin panel
2. Enter the admin PIN code
3. Click on the "Tracking" tab to view the live map
4. You'll see all users who have consented to location sharing
5. The map refreshes automatically every 10 seconds
6. Click "Refresh" to manually update the map

### For Users

1. When accessing the Easter Egg Hunt, users will see a privacy consent dialog
2. They can choose to accept or decline location sharing
3. If they accept, their location will be tracked and shared with administrators
4. If they decline, they can still participate but without location tracking
5. Users can revoke consent by closing the browser

## Technical Notes

- The data is stored in Supabase with proper row-level security policies
- The location data is only accessible to authenticated admins
- If a user doesn't consent, their location won't be stored in the database
- Even consented data is automatically deleted after 24 hours