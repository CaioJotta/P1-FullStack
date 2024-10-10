const { Router } = require('express');
const Room = require('../models/Room');
const { protect } = require('../middleware/authMiddleware');
const router = Router();


router.post('/', protect, async (req, res) => {
    const { name, description, capacity } = req.body;

    try {
        const room = new Room({
            name,
            description,
            capacity,
            createdBy: req.user 
        });

        await room.save();
        res.status(201).json({ 
            message: 'Sala criada com sucesso', 
            roomId: room.roomid,
            room 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: 'Erro ao obter as salas' });
    }
});


module.exports = router;
