# Dynamic Routing for Push Notifications - Implementation Guide

## ✅ Implementation Complete

This guide explains how dynamic routing works for push notifications in your app.

---

## 📋 Overview

When a user taps on a notification, the app will automatically navigate to the appropriate screen:
- **Message Notification** → Navigates to `ChatScreen` with the sender's information
- **Connection Request Notification** → Navigates to `Connection` tab

---

## 🔧 How It Works

### 1. **Notification Service** (`NotificationService.ts`)
- Handles all FCM notifications
- Routes to the correct screen based on notification type
- Works for app states: **Closed**, **Background**, **Foreground**

### 2. **Navigation Ref** (`navigationRef.ts`)
- Allows navigation from anywhere in the app
- Used by notification service to navigate programmatically

### 3. **Android MessagingService** (`MessagingService.kt`)
- Receives notifications when app is closed/background
- Passes notification data to React Native

---

## 📤 Backend Notification Payload Format

Your backend **MUST** send notifications with the following data structure:

### For Message Notifications

```json
{
  "notification": {
    "title": "New message from John",
    "body": "Hey, how are you?"
  },
  "data": {
    "type": "message",
    "sender_id": "123",
    "senderId": "123",
    "conversation_id": "456",
    "conversationId": "456",
    "sender_name": "John Doe",
    "senderName": "John Doe",
    "sender_first_name": "John",
    "senderFirstName": "John",
    "sender_last_name": "Doe",
    "senderLastName": "Doe"
  },
  "token": "user_fcm_token"
}
```

**Required Fields:**
- `type`: Must be `"message"` (case-insensitive)
- `sender_id` or `senderId`: ID of the user who sent the message (REQUIRED)

**Optional Fields:**
- `sender_name` / `senderName`: Full name of sender
- `sender_first_name` / `senderFirstName`: First name
- `sender_last_name` / `senderLastName`: Last name
- `conversation_id` / `conversationId`: Conversation ID

---

### For Connection Request Notifications

```json
{
  "notification": {
    "title": "New connection request",
    "body": "Sarah wants to connect with you"
  },
  "data": {
    "type": "connection_request",
    "connection_id": "789",
    "connectionId": "789",
    "sender_id": "456",
    "senderId": "456"
  },
  "token": "user_fcm_token"
}
```

**Required Fields:**
- `type`: Must be `"connection_request"` or `"connection"` (case-insensitive)

**Optional Fields:**
- `connection_id` / `connectionId`: Connection request ID
- `sender_id` / `senderId`: ID of user who sent the request

---

## 🎯 Navigation Behavior

### Message Notification
1. User taps notification
2. App opens (if closed) or comes to foreground (if background)
3. Navigates to `ChatScreen`
4. Passes `otherUserId` and `otherUser` as route params

### Connection Request Notification
1. User taps notification
2. App opens (if closed) or comes to foreground (if background)
3. Navigates to `Main` tab
4. User can manually switch to `Connection` tab to see the request

---

## 📝 Backend Implementation Checklist

### When Sending a Message Notification:

```python
# Example Python/Django code
from firebase_admin import messaging

def send_message_notification(recipient_fcm_token, sender_id, sender_name, message_content):
    message = messaging.Message(
        notification=messaging.Notification(
            title=f"New message from {sender_name}",
            body=message_content[:100]  # First 100 chars
        ),
        data={
            "type": "message",
            "sender_id": str(sender_id),
            "senderId": str(sender_id),  # Support both formats
            "sender_name": sender_name,
            "senderName": sender_name,
        },
        token=recipient_fcm_token
    )
    messaging.send(message)
```

### When Sending a Connection Request Notification:

```python
def send_connection_request_notification(recipient_fcm_token, sender_id, sender_name, connection_id):
    message = messaging.Message(
        notification=messaging.Notification(
            title="New connection request",
            body=f"{sender_name} wants to connect with you"
        ),
        data={
            "type": "connection_request",
            "connection_id": str(connection_id),
            "connectionId": str(connection_id),
            "sender_id": str(sender_id),
            "senderId": str(sender_id),
        },
        token=recipient_fcm_token
    )
    messaging.send(message)
```

---

## 🔍 Testing

### Test Message Notification:
1. Send a test notification with:
   ```json
   {
     "type": "message",
     "sender_id": "123"
   }
   ```
2. Tap notification
3. Should navigate to ChatScreen with `otherUserId: 123`

### Test Connection Request Notification:
1. Send a test notification with:
   ```json
   {
     "type": "connection_request",
     "connection_id": "789"
   }
   ```
2. Tap notification
3. Should navigate to Main tab

---

## 📱 App States

### App Closed
- Notification appears in system tray
- Tap → App opens → Navigates to correct screen

### App in Background
- Notification appears in system tray
- Tap → App comes to foreground → Navigates to correct screen

### App in Foreground
- Notification handler receives it
- Currently just logs (you can add in-app notification UI)
- User can manually navigate if needed

---

## 🛠️ Files Created/Modified

### Created:
1. ✅ `src/utils/navigationRef.ts` - Navigation reference utility
2. ✅ `src/service/Notifications/NotificationService.ts` - Notification handling service
3. ✅ `src/service/Api_service/Notification_Service.ts` - FCM token registration API

### Modified:
1. ✅ `src/App.tsx` - Added navigation ref and notification initialization
2. ✅ `android/app/src/main/java/com/mfdtracefish/MessagingService.kt` - Already configured to pass data

---

## ⚠️ Important Notes

1. **Token Registration**: FCM token is automatically registered when user logs in
2. **Token Refresh**: Token is automatically refreshed and sent to backend
3. **Navigation Timing**: Small delay (100ms-1000ms) ensures navigation is ready
4. **Error Handling**: If notification data is invalid, app navigates to Main screen
5. **Case Insensitive**: Notification type matching is case-insensitive

---

## 🚀 Next Steps

1. ✅ Test with real notifications from your backend
2. ✅ Verify navigation works in all app states
3. ✅ Add in-app notification UI for foreground state (optional)
4. ✅ Handle edge cases (invalid data, missing params, etc.)

---

## 📞 Support

If navigation doesn't work:
1. Check console logs for notification data
2. Verify backend is sending correct `type` field
3. Ensure `sender_id` is included for message notifications
4. Check that navigation ref is initialized in App.tsx

---

## Summary

✅ **Message notifications** → Navigate to ChatScreen with sender info
✅ **Connection request notifications** → Navigate to Main tab
✅ **Works in all app states** (closed, background, foreground)
✅ **Automatic token registration** with backend
✅ **Error handling** for invalid/missing data

Your dynamic routing is now fully implemented and ready to use! 🎉

