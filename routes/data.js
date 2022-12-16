const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Data = require('../models/Data');
const multer = require('multer')
const upload = multer()

router.get('/post', fetchuser, async (req, res) => {

    try {
        const data = await Data.find();
        res.json(data);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'internal server error' });
    }
})



router.post('/post', upload.single('img'), fetchuser,
    async (req, res) => {

        try {

            req.body.img = req.file
            const { img } = req.body;
            const data = await Data.create({ img: img, user: req.user.id });
            res.json({ success: true, data: data });

        }

        catch (error) {
            console.log(error.message);
            res.status(500).json({ error: 'internal server error' });
        }
    })

router.patch('/post/:id', upload.single('img'), fetchuser, async (req, res) => {
    try {
        let data = await Data.findById(req.params.id);
        if (!data) {
            return res.status(400).json({ error: 'invalid id' });
        }
        req.body.img = req.file;
        const { img } = req.body;
        if (req.user.id !== data.user.toString()) {
            return res.status(400).json({ error: 'invalid id' });
        }
        console.log(img);
        data = await Data.findByIdAndUpdate(req.params.id, { "$set":{img: img} }, { new: true });
        res.json(data);

    } catch (error) {
        return res.status(500).json({ error: 'internal server error' });
    }
})

router.patch('/post/like/:id', fetchuser, async (req, res) => {
    try {
        let data = await Data.findById(req.params.id);
        if (!data) {
            return res.status(400).json({ error: 'invalid id' });
        }
        const likes = data.likes
        if (likes.includes(data.user)) {
            return res.status(400).json({ error: 'already liked photo' });
        }

        data = await Data.findByIdAndUpdate(req.params.id, { "$push": { "likes": data.user } }, { new: true });
        res.json(data);

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'internal server error' });
    }
})

router.patch('/post/comment/:id', upload.none(), fetchuser, async (req, res) => {
    try {
        let data = await Data.findById(req.params.id);
        if (!data) {
            return res.status(400).json({ error: 'invalid id' });
        }
        const user = data.user;
        const comment = req.body.comment
        // console.log(comment);
        data = await Data.findByIdAndUpdate(req.params.id, { "$push": { comments: { [user]: comment } } }, { new: true });
        res.json(data);

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'internal server error' });
    }
})

router.delete('/post/:id', fetchuser, async (req, res) => {

    let data = await Data.findById(req.params.id);
    if (!data) {
        return res.status(400).json({ error: 'invalid' });
    }
    try {
        if (req.user.id !== data.user.toString()) {
            return res.status(400).json({ error: 'invalid id' });
        }
        data = await Data.findByIdAndDelete(req.params.id);
        res.json({ success: true, deleted: data });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'internal server error' });

    }

})


module.exports = router;