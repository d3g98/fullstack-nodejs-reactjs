const express = require('express');
const Post = require('../../models/Post');
const auth = require('../../middleware/auth');
const { validationResult, check, Result } = require('express-validator');
const router = express.Router();

//@route GET api/posts
router.get("/", auth, async (req, res)=>{
    try {
        let posts = await Post.find({ user : req.user.id }).sort({date: -1});
        console.log(posts);
        if (!posts) {
            return res.status(500).send('Server error');
        }
        res.json(posts);
    }catch (err) {
        console.log(err);
        res.status(400).send("Server error");
    }
});

//@route GET api/posts/:id
router.get("/:id", auth, async (req, res)=>{
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(500).send('Server error');
        }
        res.json(post);
    }catch (err) {
        console.log(err);
        res.status(400).send("Server error");
    }
});

//@route POST api/posts/:id
router.post("/", [auth, [
    check("text", "Text is required").not().exists()
]], async (req, res)=>{
    var errors = validationResult(req);
    if (!errors) {
        return res.status(400).json({errors: errors.array()});
    }

    const post = {
        text,
        name,
        avatar
    } = req.body;

    const newPost = new Post({
        name: post.name,
        text: post.text,
        avatar: post.avatar,
        user: req.user.id
    });
    
    await newPost.save();

    res.json(newPost);
});

//@route DELETE api/posts/:id
router.delete("/:id", auth, async (req, res)=>{
    try {
        let result = await Post.findOneAndDelete(req.params.id);
        if (!post) {
            return res.status(500).send('Server error');
        }
        res.json(result);
    }catch (err) {
        console.log(err);
        res.status(400).send("Server error");
    }
});

module.exports = router;