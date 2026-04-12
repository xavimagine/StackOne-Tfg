import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secreto_jwt_respaldo";

export const verificarJWT = (req, res, next) => {
    const token = req.cookies?.token;
    //comprueba que tenga una coockie llamada toker si la tiene permite el paso a las rutas
    if (!token) {
        return res.status(401).json({ ok: false, mensaje: "No autorizado" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ ok: false, mensaje: "Token inválido o expirado" });
    }
};
