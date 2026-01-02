# Backend Notification Payload - Quick Reference

## 📤 What to Send from Backend

### For Message Notifications (Navigate to ChatScreen)

```json
{
  "notification": {
    "title": "New message from John",
    "body": "Hey, how are you?"
  },
  "data": {
    "type": "message",
    "sender_id": "123"
  },
  "token": "user_fcm_token"
}
```

**Minimum Required:**
- `data.type` = `"message"`
- `data.sender_id` = User ID who sent the message

**Optional (for better UX):**
- `data.sender_name` = "John Doe"
- `data.sender_first_name` = "John"
- `data.sender_last_name` = "Doe"

---

### For Connection Request Notifications (Navigate to Connection Tab)

```json
{
  "notification": {
    "title": "New connection request",
    "body": "Sarah wants to connect with you"
  },
  "data": {
    "type": "connection_request",
    "connection_id": "789",
    "sender_id": "456"
  },
  "token": "user_fcm_token"
}
```

**Minimum Required:**
- `data.type` = `"connection_request"` or `"connection"`

**Optional:**
- `data.connection_id` = Connection request ID
- `data.sender_id` = User ID who sent the request

---

## 🔑 Key Points

1. **`type` field is REQUIRED** - Determines which screen to navigate to
2. **`sender_id` is REQUIRED for messages** - Used to open the correct chat
3. **Case-insensitive** - `"message"`, `"Message"`, `"MESSAGE"` all work
4. **Both formats supported** - `sender_id` and `senderId` both work

---

## ✅ Testing Checklist

- [ ] Send message notification → Should open ChatScreen
- [ ] Send connection request → Should open Main tab
- [ ] Test with app closed
- [ ] Test with app in background
- [ ] Verify navigation params are correct

---

## 🚨 Common Mistakes

❌ **Missing `type` field** → App navigates to Main screen
❌ **Missing `sender_id` for messages** → App navigates to Main screen
❌ **Wrong `type` value** → App navigates to Main screen
✅ **Always include `type` and `sender_id` (for messages)**

