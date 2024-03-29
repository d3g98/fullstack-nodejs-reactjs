const express = require('express');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require("config");
const router = express.Router();
const User = require('../../models/User');

//@route    POST api/user
//@desc     Register user
//@access   Public
router.post("/", [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email: email });

        //see if user exists
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        //get user gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        user = new User({
            name,
            email,
            avatar,
            password
        });

        //encrypt password
        user.password = await bcryptjs.hashSync(password);
        await user.save();

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