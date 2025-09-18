import express from 'express';
import Task from '../models/Task.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /tasks
// @desc    Get all tasks for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, sortBy = 'dueDate', order = 'asc' } = req.query;
    
    // Build query
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = order === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .sort(sortObject)
      .populate('userId', 'username email');

    res.json({
      message: 'Tasks retrieved successfully',
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      message: 'Server error while fetching tasks'
    });
  }
});

// @route   GET /tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('userId', 'username email');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task retrieved successfully',
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }
    
    res.status(500).json({
      message: 'Server error while fetching task'
    });
  }
});

// @route   POST /tasks
// @desc    Create a new task
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, status, priority } = req.body;

    // Validation
    if (!title || !dueDate) {
      return res.status(400).json({
        message: 'Title and due date are required'
      });
    }

    // Check if due date is valid
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({
        message: 'Invalid due date format'
      });
    }

    // Create new task
    const task = new Task({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      dueDate: dueDateObj,
      status: status || 'pending',
      priority: priority || 'medium'
    });

    await task.save();
    
    // Populate user info
    await task.populate('userId', 'username email');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      message: 'Server error while creating task'
    });
  }
});

// @route   PUT /tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, status, priority } = req.body;

    // Find task
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    // Validate due date if provided
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({
          message: 'Invalid due date format'
        });
      }
      task.dueDate = dueDateObj;
    }

    // Update fields
    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status) task.status = status;
    if (priority) task.priority = priority;

    await task.save();
    await task.populate('userId', 'username email');

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }
    
    res.status(500).json({
      message: 'Server error while updating task'
    });
  }
});

// @route   DELETE /tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task deleted successfully',
      task
    });
  } catch (error) {
    console.error('Delete task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }
    
    res.status(500).json({
      message: 'Server error while deleting task'
    });
  }
});

// @route   PATCH /tasks/:id/status
// @desc    Update task status only
// @access  Private
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Status is required'
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'username email');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task status error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }
    
    res.status(500).json({
      message: 'Server error while updating task status'
    });
  }
});

export default router;