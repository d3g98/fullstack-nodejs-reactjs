const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require("../../models/Profile");
const { check, validationResult } = require('express-validator');

//@route    GET api/profile/me
//@desc     Get current user profile
//@access   Public
router.get("/me", auth, async (req, res)=>{
    try {
        const profile = await Profile.findOne({ user : req.user.id })
        .populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server error");
    }
});

//@route    GET api/profile
//@desc     Get all profiles
//@access   Public
router.get("/", auth, async (req, res)=>{
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);

        if (!profiles) {
            return res.status(400).json({msg: 'There is no profile'});
        }

        res.json(profiles);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server error");
    }
});

//@route    GET api/profile/user/:user_id
//@desc     Get profile by user id
//@access   Public
router.get("/user/:user_id", auth, async (req, res)=>{
    try {
        const profile = await Profile.findOne({ user : req.params.user_id })
        .populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({msg: 'Profile not found'});
        }

        res.json(profile);
    } catch (err) {
        console.log(err.message);
        if (!err.kind == "ObjectId") {
            return res.status(400).json({msg: 'Profile not found'});
        }
        res.status(500).send("Server error");
    }
});

//@route    POST api/profile
//@desc     Create or update user profile
//@access   Public
router.post("/", [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('handle', 'Handle is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),
]], async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        handle,
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (handle) profileFields.handle = handle;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({user: req.user.id});
        if (profile) {
            //update
           profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
           );
           return res.json(profile);
        }
        //create
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    PUT api/profile/experience
//@desc     Add profile experience
//@access   Public
router.put("/experience", [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()
]], async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    };

    try {
        let profile = await Profile.findOne({user: req.user.id});
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    DELETE api/profile/experience/:exp_id
//@desc     Delete profile experience
//@access   Public
router.delete("/experience/:exp_id", auth, async (req, res)=>{
    try {
        let profile = await Profile.findOne({user: req.user.id});
        
        //get remove index
        console.log(req.param.exp_id);
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        console.log(removeIndex);
        if (removeIndex == -1) {
            return res.status(500).send('Server Error');
        }

        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    PUT api/profile/education
//@desc     Add profile education
//@access   Public
router.put("/education", [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()
]], async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };

    try {
        let profile = await Profile.findOne({user: req.user.id});
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    DELETE api/profile/education/:edu_id
//@desc     Delete profile education
//@access   Public
router.delete("/education/:edu_id", auth, async (req, res)=>{
    try {
        let profile = await Profile.findOne({user: req.user.id});
        
        //get remove index
        console.log(req.param.exp_id);
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.exp_id);
        console.log(removeIndex);
        if (removeIndex == -1) {
            return res.status(500).send('Server Error');
        }

        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;