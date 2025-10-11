import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';

class FCMService {
  static async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('FCM Authorization status:', authStatus);
        return true;
      } else {
        console.log('FCM Permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting FCM permission:', error);
      return false;
    }
  }

  static async getToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  static async deleteToken() {
    try {
      await messaging().deleteToken();
      console.log('FCM Token deleted');
      return true;
    } catch (error) {
      console.error('Error deleting FCM token:', error);
      return false;
    }
  }

  static setupMessageHandlers() {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('FCM Background message received:', remoteMessage);
      // Handle background message here
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('FCM Foreground message received:', remoteMessage);
      
      // Show local notification or alert
      Alert.alert(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || 'You have a new notification',
        [{ text: 'OK' }]
      );
    });

    // Handle notification tap when app is in background/quit
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('FCM Notification opened app:', remoteMessage);
      // Handle navigation based on notification data
      this.handleNotificationNavigation(remoteMessage);
    });

    // Handle notification tap when app is quit
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('FCM Notification opened app from quit state:', remoteMessage);
          // Handle navigation based on notification data
          this.handleNotificationNavigation(remoteMessage);
        }
      });
  }

  static handleNotificationNavigation(remoteMessage) {
    const data = remoteMessage.data;
    
    if (data?.type === 'order_placed') {
      // Navigate to orders page
      console.log('Navigate to orders page');
    } else if (data?.type === 'order_status_update') {
      // Navigate to specific order
      console.log('Navigate to order:', data.orderId);
    } else {
      // Navigate to notifications page
      console.log('Navigate to notifications page');
    }
  }

  static async subscribeToTopic(topic) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
      return false;
    }
  }

  static async unsubscribeFromTopic(topic) {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
      return false;
    }
  }

  static async checkPermission() {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.error('Error checking FCM permission:', error);
      return false;
    }
  }

  static async initialize() {
    try {
      // Request permission
      const hasPermission = await this.requestPermission();
      
      if (hasPermission) {
        // Get token
        const token = await this.getToken();
        
        // Setup message handlers
        this.setupMessageHandlers();
        
        console.log('FCM initialized successfully');
        return { success: true, token };
      } else {
        console.log('FCM permission denied');
        return { success: false, error: 'Permission denied' };
      }
    } catch (error) {
      console.error('Error initializing FCM:', error);
      return { success: false, error: error.message };
    }
  }
}

export default FCMService;
