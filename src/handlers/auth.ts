import { request, Request, Response } from 'express';
import slug from 'slug';
import formidable from 'formidable';
import { v4 as uuid } from 'uuid';
import User from "../models/User";
import { comparePassword, hasPassword } from '../utils/auth';
import { generateJWT } from '../utils/jwt';
import cloudinary from '../config/cloudinary';

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

// REALIZAR AUTENTICACIÓN DE USUARIO
export const getUser = async (req: Request, res: Response) => {
    res.json(req.user);
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const descripcion = req.body.descripcion;

        const handle = slug(req.body.handle, '');
        const handleExist = await User.findOne({ handle });
        if (handleExist && handleExist.email !== req.user.email) {
            let error = new Error('Nombre de usuario no disponible');
            return res.status(409).json({ error: error.message });
        }

        req.user.descripcion = descripcion;
        req.user.handle = handle;

        req.user.save();

        res.send("Perfíl actualizado correctamente");
    } catch (e) {
        const error = new Error('Hubo un error');
        res.status(500).json({ error });
    }
}

export const uploadImage = async (req: Request, res: Response) => {
    const form = formidable({multiples: false});
    
    try {
        form.parse(req, (error, fields, files) => {
            cloudinary.uploader.upload(files.file[0].filepath, {public_id: uuid()}, async function (error, result) {
                if (error) {
                    const error = new Error('Hubo un error al subir la imagen');
                    res.status(500).json({ error });
                }

                if (result) {
                    req.user.image = result.secure_url
                    req.user.save();
                    res.json({image: result.secure_url});
                }
            })
        });
    } catch (e) {
        const error = new Error('Hubo un error');
        res.status(500).json({ error });
    }
}