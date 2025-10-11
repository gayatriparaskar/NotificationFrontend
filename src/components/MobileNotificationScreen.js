import React, { useEffect, useState } from 'react';
import { View, Text, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';

const MobileNotificationScreen = ({ userId, socketUrl = 'https://notificationbackend-35f6.onrender.com' }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (userId) {
      // Connect to Socket.IO server
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('Mobile Socket connected:', newSocket.id);
        setIsConnected(true);
        
        // Register user with the new system
        newSocket.emit('register', userId);
      });

      newSocket.on('registered', (data) => {
        console.log('Mobile User registered successfully:', data);
      });

      newSocket.on('disconnect', () => {
        console.log('Mobile Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Mobile Socket connection error:', error);
        setIsConnected(false);
      });

      // Handle new simplified notification format
      newSocket.on('notification', (notificationData) => {
        console.log('Mobile Real-time notification received:', notificationData);
        
        // Add to notifications list
        setNotifications(prev => [notificationData, ...prev]);
        
        // Show native alert
        Alert.alert(
          notificationData.title,
          notificationData.message,
          [
            { text: 'OK', onPress: () => console.log('Notification acknowledged') }
          ],
          { cancelable: true }
        );
      });

      // Handle legacy notification format
      newSocket.on('new-notification', (data) => {
        console.log('Mobile Legacy notification received:', data);
        
        if (data.notification) {
          setNotifications(prev => [data.notification, ...prev]);
          
          Alert.alert(
            data.notification.title,
            data.notification.message,
            [
              { text: 'OK', onPress: () => console.log('Legacy notification acknowledged') }
            ],
            { cancelable: true }
          );
        }
      });

      // Test connection handler
      newSocket.on('test-connection-response', (data) => {
        console.log('Mobile Test connection response:', data);
        Alert.alert('Success', 'Socket connection test successful!');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [userId, socketUrl]);

  const testConnection = () => {
    if (socket) {
      socket.emit('test-connection', { userId, timestamp: new Date() });
    }
  };

  const sendOrderPlaced = () => {
    if (socket) {
      socket.emit('orderPlaced', { 
        userId, 
        orderData: { 
          orderId: 'test-' + Date.now(),
          amount: 99.99,
          items: ['Test Product']
        }
      });
    }
  };

  const renderNotification = ({ item, index }) => (
    <TouchableOpacity style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>
        {new Date(item.timestamp || item.createdAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: isConnected ? 'green' : 'red' }]}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <Text style={styles.userIdText}>User ID: {userId}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={sendOrderPlaced}>
          <Text style={styles.buttonText}>Simulate Order</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item, index) => item.id || item._id || index.toString()}
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userIdText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.45,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default MobileNotificationScreen;
