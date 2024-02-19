const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const dbUrl = "mongodb+srv://madeshc129:Sl2AMaWJ4VhToGtx@cluster0.ehrz20r.mongodb.net/userdata?retryWrites=true&w=majority"
const cors = require('cors')
const path = require('path')
const port = 7000
const UserModel = require('./models/Users')


const connectioParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,

}

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))
mongoose
    .connect(dbUrl, connectioParams)
    .then(() => {
        console.info('Connected to the Db')
    })
    .catch((e) => {
        console.log('Error :', e)
    })

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

const uplode = multer({
    storage: storage
})

app.get('/', (req, res) => {
    res.send(
        "<h1>welcome to Server</h1>"
    )
})

// ------------------uplode image------------------//
app.post('/upload', uplode.single('file'), async (req, res) => {
    const { name } = req.body
    const { password } = req.body
    UserModel.create({ image: req.file.filename, name: name, password: password })
        .then(result => res.json(result))
        .catch(err => console.log(err))
})

// ------------------get image------------------//
app.get('/getImage', (req, res) => {
    UserModel.find()
        .then(users => res.json(users))
        .catch(err => res.json(err))
})

// ------------------like image------------------//
app.post('/like/:imageId', async (req, res) => {
    const imageId = req.params.imageId;
    try {
        const image = await UserModel.findById(imageId);
        image.likes += 1;
        await image.save();
        res.json({ success: true, likes: image.likes });
    } catch (error) {
        console.error('Error liking image:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ------------------comment image------------------//
app.post('/comment/:imageId', async (req, res) => {
    const imageId = req.params.imageId;
    const { text, user } = req.body;

    try {
        const image = await UserModel.findById(imageId);
        image.comments.push({ text, user });
        await image.save();
        res.json({ success: true, comments: image.comments });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ------------------Visit your post------------------//
app.post('/visitpost', async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await UserModel.find({ name, password });

        if (user) {
            res.json({ success: true, data: user });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.listen(port, () => { console.log("server is Running") })