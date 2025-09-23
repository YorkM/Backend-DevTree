import { Router } from 'express';
import { body } from 'express-validator';
import { createAccount, login } from './handlers/auth';
import { inputHandlerErrors } from './middleware/auth';

const router = Router();

router.post('/auth/register',
    body('handle').notEmpty().withMessage("El handle no puede ir vacío"),
    body('name').notEmpty().withMessage("El nombre no puede ir vacío"),
    body('email').isEmail().withMessage("El email no es válido"),
    body('password').isLength({min: 8}).withMessage("El password es muy corto, mínimo 8 caracteres"),
    inputHandlerErrors,
    createAccount
);

router.post('/auth/login',    
    body('email').isEmail().withMessage("El email no es válido"),
    body('password').notEmpty().withMessage("El password no puede ir vacío"),
    inputHandlerErrors,
    login
);

export default router;