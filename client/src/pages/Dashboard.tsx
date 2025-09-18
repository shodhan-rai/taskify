import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Fab,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountCircle,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { taskAPI, tokenUtils, userUtils } from '../services/api';
import TaskList from '../components/TaskList';
import TaskDialog from '../components/TaskDialog';
import type { Task, User, SnackbarState } from '../types/index';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!tokenUtils.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get user data
    const userData = userUtils.getUser();
    setUser(userData);

    // Load tasks
    loadTasks();
  }, [navigate]);

  const loadTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await taskAPI.getTasks();
      setTasks(response.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      showSnackbar('Error loading tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success'): void => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = (): void => {
    setSnackbar((prev: SnackbarState) => ({ ...prev, open: false }));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleLogout = (): void => {
    tokenUtils.removeToken();
    userUtils.removeUser();
    navigate('/login');
  };

  const handleCreateTask = (): void => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task): void => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleCloseDialog = (): void => {
    setTaskDialogOpen(false);
    setEditingTask(null);
  };

  const handleTaskSaved = async (): Promise<void> => {
    setTaskDialogOpen(false);
    setEditingTask(null);
    await loadTasks();
    showSnackbar(
      editingTask ? 'Task updated successfully' : 'Task created successfully'
    );
  };

  const handleTaskDeleted = async (taskId: string): Promise<void> => {
    try {
      await taskAPI.deleteTask(taskId);
      await loadTasks();
      showSnackbar('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      showSnackbar('Error deleting task', 'error');
    }
  };

  const handleTaskStatusChanged = async (taskId: string, newStatus: Task['status']): Promise<void> => {
    try {
      await taskAPI.updateTaskStatus(taskId, newStatus);
      await loadTasks();
      showSnackbar('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      showSnackbar('Error updating task status', 'error');
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', width: '100vw', backgroundColor: '#f5f7fa' }}>
      {/* App Bar */}
      <AppBar 
        position="static"
        sx={{
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          width: '100%',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            📋 Taskify
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Welcome, {user?.username}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
              sx={{
                border: '2px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: '#667eea',
                  fontWeight: 'bold'
                }}
              >
                {user?.username?.[0]?.toUpperCase() || <AccountCircle />}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
                mt: 1,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: '#ef4444',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }
              }}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
        {/* Welcome Section */}
        <Box 
          sx={{ 
            mb: 4,
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(10px)',
            maxWidth: '1400px',
            mx: 'auto',
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            {getGreeting()}, {user?.username}!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            You have {tasks.length} task{tasks.length !== 1 ? 's' : ''} in total • 
            {tasks.filter(t => t.status === 'pending').length} pending • 
            {tasks.filter(t => t.status === 'in-progress').length} in progress • 
            {tasks.filter(t => t.status === 'completed').length} completed
          </Typography>
        </Box>

        {/* Task List */}
        <Box 
          sx={{
            background: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            p: { xs: 2, sm: 3 },
            minHeight: '60vh',
            maxWidth: '1400px',
            mx: 'auto',
          }}
        >
          <TaskList
            tasks={tasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleTaskDeleted}
            onStatusChange={handleTaskStatusChanged}
          />
        </Box>

        {/* Add Task Button */}
        <Fab
          color="primary"
          aria-label="add task"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            width: 64,
            height: 64,
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
              transform: 'scale(1.1)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
            },
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
          }}
          onClick={handleCreateTask}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </Fab>

        {/* Task Dialog */}
        <TaskDialog
          open={taskDialogOpen}
          task={editingTask}
          onClose={handleCloseDialog}
          onSave={handleTaskSaved}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Dashboard;