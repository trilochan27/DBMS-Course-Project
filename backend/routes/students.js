import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  deleteStudent,
  getCourses,
} from '../controllers/studentController.js';

const router = Router();
router.get('/courses', getCourses);
router.get('/:id', getStudentById);
router.get('/', getStudents);
router.post('/', createStudent);
router.delete('/:id', deleteStudent);
export default router;
