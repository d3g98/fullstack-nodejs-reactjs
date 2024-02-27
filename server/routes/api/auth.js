const express = require('express');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require("config");
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const router = express.Router();

//@route GET api/auth
//@desc     Test auth
//@access   Public
router.get("/", auth, async (req, res)=> {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

//@route POST api/auth
//@desc     Check user and get token
//@access   Public
router.post("/", [
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email: email });

        //see if user not exists
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Email is not exists' }] });
        }

        //encrypt password
        if (user.password == await bcryptjs.hashSync(password)) {
            return res.status(400).json({ errors: [{ msg: 'Password is wrong' }] });
        }

        //return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }

        var token = jwt.sign(
            payload,
            config.get('jwtSecret'),
            {
                expiresIn: 360000
            },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;