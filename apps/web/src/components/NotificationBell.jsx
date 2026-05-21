import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthProvider.jsx';
import { auth, db, storage } from '../lib/firebase.js';
import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  getDocs
} from 'firebase/firestore';
import {
  Badge, IconButton, Popover,
  Typography, List, ListItem,
  ListItemText, Box, Button,
  Divider, Stack
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';

export function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    let unsubscribe = null;

    const setupNotificationListener = async () => {
      try {
        // Try the main query with orderBy first
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        
        unsubscribe = onSnapshot(q, snapshot => {
          const notifs = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          setNotifications(notifs);
          setLoading(false);
        }, error => {
          console.error("Notification error:", error.message);
          
          // Check if it's an index error
          if (error.message && error.message.includes('requires an index')) {
            console.log("Falling back to simple query without orderBy");
            fallbackQuery();
          } else {
            console.error("Error listening to notifications:", error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error("Notification error:", error.message);
        
        // If setup fails, try fallback
        if (error.message && error.message.includes('requires an index')) {
          console.log("Falling back to simple query without orderBy");
          fallbackQuery();
        } else {
          console.error("Error setting up notification listener:", error);
          setLoading(false);
        }
      }
    };

    const fallbackQuery = () => {
      try {
        // Fallback query without orderBy
        const fallbackQ = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          limit(20)
        );
        
        unsubscribe = onSnapshot(fallbackQ, snapshot => {
          const notifs = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          
          // Manual sorting if createdAt is available
          const sortedNotifs = notifs.sort((a, b) => {
            const aTime = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
            const bTime = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
            return bTime - aTime; // Descending order
          });
          
          setNotifications(sortedNotifs);
          setLoading(false);
        }, error => {
          console.error("Fallback query error:", error.message);
          setLoading(false);
          setNotifications([]); // Set empty array on error
        });
      } catch (fallbackError) {
        console.error("Fallback query setup error:", fallbackError.message);
        setLoading(false);
        setNotifications([]); // Set empty array on error
      }
    };

    setupNotificationListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const markRead = async (notifId) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n =>
        updateDoc(doc(db, 'notifications', n.id), { read: true })
      ));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markRead(notification.id);
    }

    // Navigate to dashboard if type contains "rental"
    if (notification?.type && notification.type.includes('rental')) {
      navigate('/dashboard');
    }

    handleClose();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const showBadge = unreadCount > 0;

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        {showBadge ? (
          <Badge badgeContent={unreadCount > 9 ? '9+' : unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        ) : (
          <NotificationsNoneIcon />
        )}
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            mt: 1
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={markAllRead}
                sx={{ textTransform: 'none' }}
              >
                Mark all read
              </Button>
            )}
          </Stack>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'rgba(21,101,192,0.08)',
                    '&:hover': {
                      backgroundColor: notification.read ? 'rgba(0,0,0,0.04)' : 'rgba(21,101,192,0.12)'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: notification.read ? 'normal' : 'bold',
                          color: notification.read ? 'inherit' : '#1565C0'
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
