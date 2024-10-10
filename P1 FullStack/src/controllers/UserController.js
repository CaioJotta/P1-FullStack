const userRepository = require("../repositories/UserRepository");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/postgree');


class UserController {
    
    static async register(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            
            const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (userExists.rows.length > 0) {
                return res.status(400).json({ msg: 'Usuário já existe' });
            }

            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            
            const newUser = await pool.query(
                'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
                [name, email, hashedPassword]
            );

            
            const payload = { userId: newUser.rows[0].id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(201).json({ token });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Erro no servidor');
        }
    }

    
    static async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (user.rows.length === 0) {
                return res.status(400).json({ msg: 'Credenciais inválidas' });
            }

            const isMatch = await bcrypt.compare(password, user.rows[0].password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Credenciais inválidas' });
            }

            
            const payload = { userId: user.rows[0].id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({ token });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Erro no servidor');
        }
    }

    
    static protect(req, res, next) {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ msg: 'Nenhum token, autorização negada' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.userId;
            next();
        } catch (error) {
            res.status(401).json({ msg: 'Token inválido' });
        }
    }
}

module.exports = UserController;
