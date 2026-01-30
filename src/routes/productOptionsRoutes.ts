import { Router } from 'express';
import {
    getOptionsByType,
    createOption,
    updateOption,
    deleteOption,
    getOptionUsage,
    incrementUsage,
    decrementUsage
} from '../controllers/productOptionsController';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

// IMPORTANT: Specific routes MUST come before generic /:type or /:id routes
// Otherwise Express will match the generic route first

// Get usage information for an option (MUST be before /:type)
router.get('/:id/usage', isAuthenticated, getOptionUsage);

// Increment/decrement usage count (MUST be before /:type)
router.post('/:id/increment', isAuthenticated, incrementUsage);
router.post('/:id/decrement', isAuthenticated, decrementUsage);

// Get all options by type (generic route, comes after specific routes)
router.get('/:type', getOptionsByType);

// Create new option
router.post('/', isAuthenticated, createOption);

// Update option
router.put('/:id', isAuthenticated, updateOption);

// Delete option (with usage validation)
router.delete('/:id', isAuthenticated, deleteOption);

export default router;
