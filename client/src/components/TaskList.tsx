import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { createPortal } from 'react-dom';
import type { SelectChangeEvent } from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import type { Task } from '../types/index';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

interface StatusAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

type StatusFilter = 'all' | Task['status'];

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onStatusChange 
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{x: number, y: number} | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string): void => {
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    console.log('Menu open for task:', taskId, 'Element:', target, 'isConnected:', target.isConnected);
    console.log('Button position:', rect);
    
    // Calculate menu dimensions (more accurate estimates)
    const menuWidth = 150; // Increased to accommodate "Mark Complete", "Pause Task", etc.
    const menuHeight = 120; // Increased for 4 menu items
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Start with position to the left of button (safer for right-aligned buttons)
    let x = rect.left - menuWidth - 10;
    let y = rect.top;
    
    // If menu would go off the left edge, position to the right
    if (x < 10) {
      x = rect.right + 10;
    }
    
    // If still off the right edge, position at the edge with margin
    if (x + menuWidth > viewportWidth - 10) {
      x = viewportWidth - menuWidth - 10;
    }
    
    // Adjust if menu would go off the bottom edge
    if (y + menuHeight > viewportHeight - 10) {
      y = viewportHeight - menuHeight - 10;
    }
    
    // Ensure menu doesn't go off the top edge
    if (y < 10) {
      y = 10;
    }
    
    // Final safety check - ensure x is not negative
    if (x < 10) {
      x = 10;
    }
    
    console.log('Final menu position:', { x, y }, 'Viewport:', { viewportWidth, viewportHeight });
    
    setMenuPosition({ x, y });
    setSelectedTaskId(taskId);
  };

  const handleMenuClose = (): void => {
    setSelectedTaskId(null);
    setMenuPosition(null);
  };

  const getStatusColor = (status: Task['status']): 'success' | 'warning' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: Task['priority']): 'error' | 'warning' | 'info' | 'default' => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDueDate = (date: string): string => {
    const dueDate = new Date(date);
    
    if (isToday(dueDate)) {
      return 'Today';
    } else if (isTomorrow(dueDate)) {
      return 'Tomorrow';
    } else {
      return format(dueDate, 'MMM dd, yyyy');
    }
  };

  const getDueDateColor = (date: string): 'error' | 'warning' | 'default' => {
    const dueDate = new Date(date);
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return 'error';
    } else if (isToday(dueDate)) {
      return 'warning';
    } else {
      return 'default';
    }
  };

  const getStatusActions = (task: Task): StatusAction[] => {
    const actions: StatusAction[] = [];
    
    switch (task.status) {
      case 'pending':
        actions.push({
          label: 'Start Task',
          icon: <StartIcon />,
          onClick: () => onStatusChange(task._id, 'in-progress')
        });
        actions.push({
          label: 'Mark Complete',
          icon: <CompleteIcon />,
          onClick: () => onStatusChange(task._id, 'completed')
        });
        break;
      case 'in-progress':
        actions.push({
          label: 'Mark Complete',
          icon: <CompleteIcon />,
          onClick: () => onStatusChange(task._id, 'completed')
        });
        actions.push({
          label: 'Pause Task',
          icon: <PauseIcon />,
          onClick: () => onStatusChange(task._id, 'pending')
        });
        break;
      case 'completed':
        actions.push({
          label: 'Reopen Task',
          icon: <StartIcon />,
          onClick: () => onStatusChange(task._id, 'pending')
        });
        break;
      default:
        break;
    }
    
    return actions;
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  });

  const groupedTasks = {
    pending: filteredTasks.filter(task => task.status === 'pending'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <Card 
      sx={{ 
        mb: 3, 
        opacity: task.status === 'completed' ? 0.8 : 1,
        position: 'relative',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                mb: 1,
                fontWeight: 600,
                color: task.status === 'completed' ? 'text.secondary' : 'text.primary'
              }}
            >
              {task.title}
            </Typography>
            
            {task.description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  lineHeight: 1.6
                }}
              >
                {task.description}
              </Typography>
            )}
            
            <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
              <Chip
                label={task.status.replace('-', ' ')}
                color={getStatusColor(task.status)}
                size="small"
                sx={{ 
                  fontWeight: 500,
                  borderRadius: 2,
                  textTransform: 'capitalize'
                }}
              />
              <Chip
                label={`${task.priority} priority`}
                color={getPriorityColor(task.priority)}
                variant="outlined"
                size="small"
                sx={{ 
                  fontWeight: 500,
                  borderRadius: 2,
                  textTransform: 'capitalize'
                }}
              />
              <Chip
                label={formatDueDate(task.dueDate)}
                color={getDueDateColor(task.dueDate)}
                variant="outlined"
                size="small"
                sx={{ 
                  fontWeight: 500,
                  borderRadius: 2
                }}
              />
            </Box>
          </Box>
          
          <IconButton
            aria-label="more"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, task._id);
            }}
            sx={{
              ml: 2,
              position: 'relative',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              }
            }}
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const handleStatusFilterChange = (event: SelectChangeEvent<StatusFilter>): void => {
    setStatusFilter(event.target.value as StatusFilter);
  };

  return (
    <Box>
      {/* Filter Controls */}
      <Box sx={{ mb: 4 }}>
        <FormControl 
          size="small" 
          sx={{ 
            minWidth: 160,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              '&:hover fieldset': {
                borderColor: '#667eea',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#667eea',
            },
          }}
        >
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="all">All Tasks</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {tasks.length === 0 ? (
        <Box 
          textAlign="center" 
          py={8}
          sx={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
            borderRadius: 3,
            border: '2px dashed rgba(102, 126, 234, 0.2)',
          }}
        >
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 500, mb: 2 }}>
            No tasks yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Click the + button to create your first task and start organizing!
          </Typography>
        </Box>
      ) : filteredTasks.length === 0 ? (
        <Box 
          textAlign="center" 
          py={8}
          sx={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
            borderRadius: 3,
            border: '2px dashed rgba(102, 126, 234, 0.2)',
          }}
        >
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 500, mb: 2 }}>
            No tasks match the current filter
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try selecting a different filter or create a new task
          </Typography>
        </Box>
      ) : statusFilter === 'all' ? (
        // Grouped view when showing all tasks
        <>
          {Object.entries(groupedTasks).map(([status, taskList]) => {
            if (taskList.length === 0) return null;
            
            return (
              <Accordion 
                key={status} 
                defaultExpanded
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  '&:before': {
                    display: 'none',
                  },
                  '& .MuiAccordionSummary-root': {
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    borderRadius: 2,
                    fontWeight: 600,
                  },
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                    }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      color: '#667eea'
                    }}
                  >
                    {status.replace('-', ' ')} ({taskList.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                  {taskList.map(task => (
                    <TaskCard key={task._id} task={task} />
                  ))}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </>
      ) : (
        // Simple list view when filtering
        filteredTasks.map(task => (
          <TaskCard key={task._id} task={task} />
        ))
      )}

      {/* Custom Context Menu */}
      {createPortal(
        menuPosition && selectedTaskId && (() => {
          const task = tasks.find(t => t._id === selectedTaskId);
          if (!task) return null;
          
          return (
            <Box
              sx={{
                position: 'fixed',
                left: menuPosition.x,
                top: menuPosition.y,
                zIndex: 9999,
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                minWidth: 150,
                py: 1,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {getStatusActions(task).map((action, index) => (
                <Box
                  key={index}
                  onClick={() => {
                    action.onClick();
                    handleMenuClose();
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    }
                  }}
                >
                  {action.icon}
                  <Typography sx={{ ml: 1 }}>{action.label}</Typography>
                </Box>
              ))}
              <Box
                onClick={() => {
                  onEditTask(task);
                  handleMenuClose();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  }
                }}
              >
                <EditIcon />
                <Typography sx={{ ml: 1 }}>Edit</Typography>
              </Box>
              <Box
                onClick={() => {
                  onDeleteTask(selectedTaskId);
                  handleMenuClose();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  }
                }}
              >
                <DeleteIcon />
                <Typography sx={{ ml: 1 }}>Delete</Typography>
              </Box>
            </Box>
          );
        })(),
        document.body
      )}

      {/* Background overlay to close menu when clicking outside */}
      {menuPosition && createPortal(
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998,
          }}
          onClick={handleMenuClose}
        />,
        document.body
      )}
    </Box>
  );
};

export default TaskList;