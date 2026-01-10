import express from 'express';
import {
    getTimeBlocks,
    getTimeBlockById,
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    checkConflict
} from '../controllers/timeBlockController';

const router = express.Router();

/**
 * @route   GET /api/time-blocks
 * @desc    Obtener todos los bloques de tiempo (con filtros opcionales)
 * @query   date, startDate, endDate, blockType
 * @access  Private (Admin)
 */
router.get('/', getTimeBlocks);

/**
 * @route   GET /api/time-blocks/:id
 * @desc    Obtener un bloqueo de tiempo por ID
 * @access  Private (Admin)
 */
router.get('/:id', getTimeBlockById);

/**
 * @route   POST /api/time-blocks
 * @desc    Crear nuevo bloqueo de tiempo
 * @access  Private (Admin)
 */
router.post('/', createTimeBlock);

/**
 * @route   PUT /api/time-blocks/:id
 * @desc    Actualizar bloqueo de tiempo
 * @access  Private (Admin)
 */
router.put('/:id', updateTimeBlock);

/**
 * @route   DELETE /api/time-blocks/:id
 * @desc    Eliminar bloqueo de tiempo
 * @access  Private (Admin)
 */
router.delete('/:id', deleteTimeBlock);

/**
 * @route   POST /api/time-blocks/check-conflict
 * @desc    Verificar conflictos en un horario
 * @access  Private (Admin)
 */
router.post('/check-conflict', checkConflict);

export default router;
