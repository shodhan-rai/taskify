import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { taskAPI } from '../services/api';
import type { Task } from '../types/index';

interface TaskDialogProps {
  open: boolean;
  task?: Task | null;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  title: string;
  description: string;
  dueDate: Dayjs;
  status: Task['status'];
  priority: Task['priority'];
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ 
  open, 
  task, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    dueDate: dayjs().add(1, 'day'),
    status: 'pending',
    priority: 'medium',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>('');

  // Initialize form data when dialog opens or task changes
  useEffect(() => {
    if (open) {
      if (task) {
        // Editing existing task
        setFormData({
          title: task.title || '',
          description: task.description || '',
          dueDate: dayjs(task.dueDate),
          status: task.status || 'pending',
          priority: task.priority || 'medium',
        });
      } else {
        // Creating new task
        setFormData({
          title: '',
          description: '',
          dueDate: dayjs().add(1, 'day'),
          status: 'pending',
          priority: 'medium',
        });
      }
      setErrors({});
      setApiError('');
    }
  }, [open, task]);

  const handleChange = <K extends keyof FormData>(field: K) => (value: FormData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    handleChange(name as keyof FormData)(value);
  };

  const handleSelectChange = (field: 'status' | 'priority') => (
    event: SelectChangeEvent<string>
  ): void => {
    handleChange(field)(event.target.value as FormData[typeof field]);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!formData.dueDate || !formData.dueDate.isValid()) {
      newErrors.dueDate = 'Valid due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate.toISOString(),
        status: formData.status,
        priority: formData.priority,
      };

      if (task) {
        // Update existing task
        await taskAPI.updateTask(task._id, taskData);
      } else {
        // Create new task
        await taskAPI.createTask(taskData);
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving task:', error);
      setApiError(
        error.response?.data?.message || 
        `An error occurred while ${task ? 'updating' : 'creating'} the task`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (): void => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            textAlign: 'center',
            py: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {task ? '✏️ Edit Task' : '✨ Create New Task'}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {apiError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2
              }}
            >
              {apiError}
            </Alert>
          )}

          <Box sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="normal"
              name="title"
              label="Task Title"
              fullWidth
              required
              value={formData.title}
              onChange={handleTextFieldChange}
              error={!!errors.title}
              helperText={errors.title}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
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
            />

            <TextField
              margin="normal"
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleTextFieldChange}
              error={!!errors.description}
              helperText={errors.description}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
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
            />

            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={(newValue: Dayjs | null) => {
                if (newValue) {
                  handleChange('dueDate')(newValue);
                }
              }}
              minDate={dayjs()}
              disabled={loading}
              slotProps={{
                textField: {
                  margin: "normal",
                  fullWidth: true,
                  required: true,
                  error: !!errors.dueDate,
                  helperText: errors.dueDate,
                  disabled: loading,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
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
                  }
                }
              }}
            />

            <FormControl 
              fullWidth 
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
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
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={handleSelectChange('status')}
                disabled={loading}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            <FormControl 
              fullWidth 
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
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
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={handleSelectChange('priority')}
                disabled={loading}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 500,
              color: '#667eea',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              task ? 'Update Task' : 'Create Task'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TaskDialog;