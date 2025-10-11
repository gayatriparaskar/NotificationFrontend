import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const NotificationTester = () => {
  const { socket, isConnected, notifications } = useSocket();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    // Listen for test results
    const handleTestResult = (result) => {
      setTestResults(prev => [...prev, result]);
    };

    if (socket) {
      socket.on('test-result', handleTestResult);
    }

    return () => {
      if (socket) {
        socket.off('test-result', handleTestResult);
      }
    };
  }, [socket]);

  const testSocketConnection = () => {
    if (socket && isConnected) {
      socket.emit('test-connection', { 
        userId: user?._id, 
        timestamp: new Date(),
        testType: 'connection'
      });
      toast.info('Testing socket connection...');
    } else {
      toast.error('Socket not connected');
    }
  };

  const testOrderPlaced = () => {
    if (socket && isConnected) {
      socket.emit('orderPlaced', {
        userId: user?._id,
        orderData: {
          orderId: 'test-' + Date.now(),
          amount: 99.99,
          items: ['Test Product 1', 'Test Product 2'],
          customerName: user?.name || 'Test User'
        }
      });
      toast.info('Simulating order placement...');
    } else {
      toast.error('Socket not connected');
    }
  };

  const testOrderStatusUpdate = () => {
    if (socket && isConnected) {
      socket.emit('orderStatusUpdate', {
        userId: user?._id,
        orderId: 'test-order-' + Date.now(),
        status: 'shipped',
        message: 'Your order has been shipped and is on its way!'
      });
      toast.info('Simulating order status update...');
    } else {
      toast.error('Socket not connected');
    }
  };

  const testDirectNotification = async () => {
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user?._id,
          message: 'This is a direct API test notification!'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Direct notification sent successfully!');
      } else {
        toast.error('Failed to send direct notification');
      }
    } catch (error) {
      console.error('Error sending direct notification:', error);
      toast.error('Error sending direct notification');
    }
  };

  const testSocketNotification = async () => {
    try {
      const response = await fetch('/api/test-socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user?._id,
          message: 'This is a direct socket test notification!'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Socket notification sent successfully!');
      } else {
        toast.error('Failed to send socket notification');
      }
    } catch (error) {
      console.error('Error sending socket notification:', error);
      toast.error('Error sending socket notification');
    }
  };

  const clearNotifications = () => {
    setTestResults([]);
    toast.info('Test results cleared');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Notification System Tester</h2>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {user && (
            <span className="text-gray-600">User: {user.name} ({user._id})</span>
          )}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testSocketConnection}
          disabled={!isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Test Socket Connection
        </button>

        <button
          onClick={testOrderPlaced}
          disabled={!isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Simulate Order Placed
        </button>

        <button
          onClick={testOrderStatusUpdate}
          disabled={!isConnected}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Simulate Order Update
        </button>

        <button
          onClick={testDirectNotification}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Direct API
        </button>

        <button
          onClick={testSocketNotification}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Test Direct Socket
        </button>

        <button
          onClick={clearNotifications}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {/* Real-time Notifications */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Real-time Notifications ({notifications.length})</h3>
        <div className="max-h-64 overflow-y-auto border rounded-lg">
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No notifications received yet</p>
          ) : (
            notifications.map((notification, index) => (
              <div key={index} className="p-3 border-b last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.timestamp || notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {notification.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test Results */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Test Results ({testResults.length})</h3>
        <div className="max-h-64 overflow-y-auto border rounded-lg">
          {testResults.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No test results yet</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="p-3 border-b last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">{result.testType}</h4>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How to Test</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Ensure you're logged in and socket is connected (green indicator)</li>
          <li>Click "Test Socket Connection" to verify real-time communication</li>
          <li>Click "Simulate Order Placed" to test order notifications</li>
          <li>Click "Simulate Order Update" to test status change notifications</li>
          <li>Click "Test Direct API" to test HTTP-based notifications</li>
          <li>Click "Test Direct Socket" to test direct socket emissions</li>
          <li>Watch for toast notifications and real-time updates in the lists above</li>
        </ol>
      </div>
    </div>
  );
};

export default NotificationTester;
