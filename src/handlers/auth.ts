import { Request, Response } from 'express';
import slug from 'slug';
import User from "../models/User";
import { comparePassword, hasPassword } from '../utils/auth';
import { generateJWT } from '../utils/jwt';

// CREAR UNA CUENTA DE USUARIO
export const createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;  

    const userExist = await User.findOne({email});
    if (userExist) {
        let error = new Error('El usuario ya está registrado');
        return res.status(409).json({ error: error.message });
    }

    const handle = slug(req.body.handle, '');
    const handleExist = await User.findOne({handle});
    if (handleExist) {
        let error = new Error('Nombre de usuario no disponible');
        return res.status(409).json({ error: error.message });
    }

    const passwordHas = await hasPassword(password);

    const user = new User(req.body);
    user.password = passwordHas;
    user.handle = handle;
    await user.save();

    res.status(201).send("Usuario creado correctamente");
}

// REALIZAR AUTENTICACIÓN DE USUARIO
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;   

    const user = await User.findOne({email});
    if (!user) {
        let error = new Error('El usuario no está registrado');
        return res.status(404).json({ error: error.message });
    }

    const result = await comparePassword(password, user.password);
    if (!result) return res.status(401).json({error: "Usuario no autenticado"});

    const token = generateJWT({id: user._id});

    return res.status(200).send(token);
}