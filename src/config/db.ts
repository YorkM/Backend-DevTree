import mongoose from "mongoose";
import colors from 'colors';

export const conectarDB = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.URL_MONGO);
        const url = `Mongo DB conectado en ${connection.host} - ${connection.port}`;
        console.log(colors.cyan.bold(url));
    } catch (error) {
        console.log(colors.bgRed.white.bold(error.message));
        process.exit(1);
    }
}