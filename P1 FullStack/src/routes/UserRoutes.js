
const { Router } = require('express');
const UserController = require("../controllers/UserController"); 

const router = Router();


router.post('/register', UserController.register); 

router.post('/login', UserController.login); 


router.get('/protected', UserController.protect, (req, res) => {
    res.json({ msg: 'Esta é uma rota protegida' });
});



module.exports = router; 
