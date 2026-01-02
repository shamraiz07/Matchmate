# Push Notifications Implementation Guide

## Current Status
✅ Firebase is already configured (`@react-native-firebase/app` and `@react-native-firebase/auth` are installed)
❌ Push notification library is NOT installed
❌ No notification permissions configured
❌ No notification handlers implemented
❌ No FCM token registration with backend
❌ Backend integration for sending notifications is missing

---

## Work Required on Your Side

### 1. **Install Push Notification Library** ⚠️ REQUIRED

You need to install `@react-native-firebase/messaging`:

```bash
npm install @react-native-firebase/messaging
```

For iOS, you'll also need to run:
```bash
cd ios && pod install && cd ..
```

---

### 2. **Android Configuration** ⚠️ REQUIRED

#### A. Add Notification Permissions to AndroidManifest.xml
Add these permissions in `/android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

#### B. Add Firebase Messaging Service
Create a file `/android/app/src/main/java/com/mfdtracefish/MessagingService.kt` (or `.java` if using Java) to handle background notifications.

#### C. Update AndroidManifest.xml
Add the service declaration in the `<application>` tag:

```xml
<service
    android:name=".MessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

#### D. Update google-services.json
Ensure your `google-services.json` file has Firebase Cloud Messaging (FCM) enabled in Firebase Console.

---

### 3. **iOS Configuration** ⚠️ REQUIRED

#### A. Update AppDelegate.swift
Add Firebase Messaging imports and setup:

```swift
import FirebaseCore
import FirebaseMessaging
import UserNotifications
```

#### B. Request Notification Permissions
Add notification permission request in `didFinishLaunchingWithOptions`.

#### C. Update Info.plist
Add notification-related keys if needed (usually handled automatically by Firebase).

#### D. Configure APNs (Apple Push Notification service)
- Enable Push Notifications capability in Xcode
- Upload APNs certificate/key to Firebase Console
- Configure APNs in Firebase project settings

---

### 4. **Frontend Code Implementation** ⚠️ REQUIRED

#### A. Create Notification Service
Create `/src/service/Notifications/NotificationService.ts` to:
- Request notification permissions
- Get FCM token
- Register token with backend API
- Handle foreground/background notifications
- Handle notification taps

#### B. Create API Endpoint for Token Registration
Add endpoint in `/src/service/Endpoint.ts`:
```typescript
export const ENDPOINTS_Notifications = {
  REGISTER_FCM_TOKEN: '/notifications/register-token/',
  UNREGISTER_FCM_TOKEN: '/notifications/unregister-token/',
};
```

#### C. Create API Service
Create `/src/service/Api_service/Notification_Service.tsx` to:
- Send FCM token to backend
- Handle token updates

#### D. Create React Hook
Create `/src/service/Hooks/Notification_Hook.ts` for:
- Registering/unregistering tokens
- Managing notification state

#### E. Initialize Notifications in App.tsx
- Request permissions on app start
- Register FCM token
- Set up notification listeners
- Handle notification navigation

---

### 5. **Backend Integration** ⚠️ REQUIRED

#### A. Create API Endpoints
Your backend needs these endpoints:

1. **Register FCM Token**
   - `POST /notifications/register-token/`
   - Body: `{ "fcm_token": "string", "device_id": "string", "platform": "ios" | "android" }`
   - Store token associated with user

2. **Unregister FCM Token** (optional, for logout)
   - `POST /notifications/unregister-token/`
   - Body: `{ "fcm_token": "string" }`

#### B. Send Notifications from Backend
When these events occur, your backend should send FCM notifications:

1. **New Message Notification**
   - Trigger: When a message is sent via `/v1/messages/send/`
   - Payload should include:
     - `title`: "New message from [sender name]"
     - `body`: Message content preview
     - `data`: `{ "type": "message", "sender_id": number, "conversation_id": number }`

2. **Connection Request Notification**
   - Trigger: When connection request is sent via `/v1/connections/request/`
   - Payload should include:
     - `title`: "New connection request"
     - `body`: "[User name] wants to connect with you"
     - `data`: `{ "type": "connection_request", "connection_id": number, "sender_id": number }`

#### C. Backend Notification Payload Structure
```json
{
  "notification": {
    "title": "Notification Title",
    "body": "Notification body text"
  },
  "data": {
    "type": "message" | "connection_request",
    "sender_id": "123",
    "conversation_id": "456",
    "connection_id": "789"
  },
  "token": "user_fcm_token"
}
```

---

### 6. **Notification Handling Logic** ⚠️ REQUIRED

#### A. Foreground Notifications
- Show in-app notification when app is open
- Use `react-native-toast-message` or custom notification component

#### B. Background Notifications
- System handles automatically when app is in background

#### C. Notification Tap Handling
- Navigate to appropriate screen:
  - Message notifications → Navigate to ChatScreen with sender_id
  - Connection requests → Navigate to Connection screen

#### D. Badge Count Management
- Update app badge count for unread messages/requests
- Clear badge when user views messages/connections

---

### 7. **Testing Requirements** ⚠️ REQUIRED

#### A. Test Scenarios
1. ✅ App closed → Receive notification → Tap → App opens to correct screen
2. ✅ App in background → Receive notification → Tap → Navigate to correct screen
3. ✅ App in foreground → Receive notification → Show in-app notification
4. ✅ Multiple notifications → Verify badge count
5. ✅ Token refresh → Verify token is updated on backend

#### B. Platform-Specific Testing
- **Android**: Test on Android 13+ (requires POST_NOTIFICATIONS permission)
- **iOS**: Test on physical device (simulator doesn't support push notifications)

---

## Implementation Priority

### Phase 1: Foundation (Must Do First)
1. Install `@react-native-firebase/messaging`
2. Configure Android permissions
3. Configure iOS permissions and APNs
4. Create notification service
5. Register FCM token with backend

### Phase 2: Backend Integration
1. Create backend endpoints for token registration
2. Implement notification sending logic for messages
3. Implement notification sending logic for connection requests

### Phase 3: Frontend Handling
1. Handle foreground notifications
2. Handle notification taps/navigation
3. Update badge counts
4. Handle token refresh

### Phase 4: Testing & Polish
1. Test all scenarios
2. Handle edge cases
3. Add error handling
4. Optimize performance

---

## Current App Flow (For Reference)

### Messages
- **API Endpoint**: `/v1/messages/all/` (GET) - Fetches all conversations
- **Send Message**: `/v1/messages/send/` (POST)
- **Current Implementation**: Polling-based (refetch on screen focus)
- **Notification Trigger**: Backend should send FCM when message is sent

### Connection Requests
- **API Endpoint**: `/v1/connections/pending/received/` (GET) - Fetches pending requests
- **Send Request**: `/v1/connections/request/` (POST)
- **Current Implementation**: Polling-based (refetch on screen focus)
- **Notification Trigger**: Backend should send FCM when connection request is sent

---

## Additional Considerations

1. **Token Management**
   - Store FCM token securely
   - Refresh token when it changes
   - Unregister token on logout

2. **User Preferences**
   - Allow users to enable/disable notifications
   - Allow users to choose notification types (messages, connections, etc.)

3. **Privacy**
   - Only send notifications to users who have opted in
   - Respect user's notification preferences

4. **Performance**
   - Don't send duplicate notifications
   - Batch notifications if multiple events occur quickly
   - Handle notification delivery failures gracefully

---

## Files That Need to Be Created/Modified

### New Files to Create:
1. `/src/service/Notifications/NotificationService.ts`
2. `/src/service/Api_service/Notification_Service.tsx`
3. `/src/service/Hooks/Notification_Hook.ts`
4. `/android/app/src/main/java/com/mfdtracefish/MessagingService.kt` (or .java)

### Files to Modify:
1. `/package.json` - Add dependency
2. `/android/app/src/main/AndroidManifest.xml` - Add permissions and service
3. `/ios/MFDTraceFish/AppDelegate.swift` - Add Firebase Messaging setup
4. `/src/service/Endpoint.ts` - Add notification endpoints
5. `/src/App.tsx` - Initialize notifications
6. `/src/screens/messages/ChatScreen.tsx` - Handle notification navigation
7. `/src/screens/connection/Connection.tsx` - Handle notification navigation

---

## Summary

**Total Work Items:**
- ✅ 1 library installation
- ✅ 4 Android configuration steps
- ✅ 4 iOS configuration steps  
- ✅ 5 frontend code files to create/modify
- ✅ 2 backend API endpoints to create
- ✅ 2 backend notification triggers to implement
- ✅ Multiple testing scenarios

**Estimated Complexity:** Medium to High
**Estimated Time:** 2-3 days for full implementation and testing

---

## Next Steps

1. Review this document
2. Install the notification library
3. Configure platform-specific settings
4. Implement frontend notification service
5. Coordinate with backend team for API endpoints
6. Test thoroughly on both platforms

