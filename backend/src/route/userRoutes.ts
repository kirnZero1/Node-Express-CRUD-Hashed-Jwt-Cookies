import express from 'express';
import { getUsers, getUser, deleteUser, createUser, updateUser, loginUser, logoutUser } from '../controllers/userControllers';
import { useAuth } from '../middleware/useAuth';

const router = express.Router();

router.get('/',useAuth, getUsers)
router.get('/:id', useAuth, getUser)
router.delete('/delete/:id', useAuth, deleteUser)
router.post('/create', createUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.patch('/update/:id', useAuth, updateUser)



export const usersRoute = router;

module.exports = {
    usersRoute
}