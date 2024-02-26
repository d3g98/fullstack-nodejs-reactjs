const express = require('express');
const router = express.Router();

//@route GET api/profile
router.get("/", (req, res)=>res.send('profile'));

module.exports = router;