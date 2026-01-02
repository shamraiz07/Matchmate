package com.mfdtracefish

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FCM", "New Token: $token")
        // Token will be sent to backend from React Native side
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        Log.d("FCM", "Message Received - From: ${remoteMessage.from}")

        // Check if message contains notification payload
        remoteMessage.notification?.let { notification ->
            Log.d("FCM", "Notification Title: ${notification.title}")
            Log.d("FCM", "Notification Body: ${notification.body}")
            
            // Show notification with app icon
            showNotification(
                title = notification.title ?: "New Notification",
                message = notification.body ?: "",
                data = remoteMessage.data
            )
        } ?: run {
            // If no notification payload, check data payload
            if (remoteMessage.data.isNotEmpty()) {
                Log.d("FCM", "Data-only message: ${remoteMessage.data}")
                
                // Extract title and body from data payload
                val title = remoteMessage.data["title"] ?: "New Notification"
                val body = remoteMessage.data["body"] ?: remoteMessage.data["message"] ?: ""
                
                // Show notification from data payload
                showNotification(
                    title = title,
                    message = body,
                    data = remoteMessage.data
                )
            }
        }
    }

    private fun showNotification(title: String, message: String, data: Map<String, String>) {
        // Create notification channel for Android 8.0+
        createNotificationChannel()

        // Create intent to open MainActivity when notification is tapped
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            
            // Add data to intent for navigation
            data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Get default notification sound
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        // Get app icon for large icon (shown in notification)
        var largeIconResId = 0
        var smallIconResId = android.R.drawable.ic_dialog_info // Default fallback
        
        try {
            // Try to get app launcher icon
            val appIconResId = resources.getIdentifier("ic_launcher", "mipmap", packageName)
            if (appIconResId != 0) {
                largeIconResId = appIconResId
                // For small icon, try to use a white/transparent version if available
                // Otherwise, Android will automatically create a monochrome version
                val smallIconWhite = resources.getIdentifier("ic_notification", "drawable", packageName)
                if (smallIconWhite != 0) {
                    smallIconResId = smallIconWhite
                } else {
                    // Use app icon as small icon (Android will auto-convert to monochrome)
                    smallIconResId = appIconResId
                }
            }
        } catch (e: Exception) {
            Log.e("FCM", "Error getting app icon: ${e.message}")
        }

        // Build notification
        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(smallIconResId) // Small icon for status bar
            .setContentTitle(title)
            .setContentText(message)
            .setAutoCancel(true) // Auto dismiss when tapped
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message)) // Expandable notification

        // Set large icon (app icon) if available
        if (largeIconResId != 0) {
            try {
                val largeIcon = BitmapFactory.decodeResource(resources, largeIconResId)
                notificationBuilder.setLargeIcon(largeIcon)
            } catch (e: Exception) {
                Log.e("FCM", "Error setting large icon: ${e.message}")
            }
        }

        // Show notification
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
        
        Log.d("FCM", "Notification shown: $title - $message")
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESCRIPTION
                enableVibration(true)
                enableLights(true)
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
            Log.d("FCM", "Notification channel created: $CHANNEL_ID")
        }
    }

    companion object {
        private const val CHANNEL_ID = "matchmate_notifications"
        private const val CHANNEL_NAME = "Matchmate Notifications"
        private const val CHANNEL_DESCRIPTION = "Notifications for messages and connection requests"
    }
}
