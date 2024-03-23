const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const cors = require('cors')
const bcrypt = require('bcrypt')
const dbUrl = "mongodb+srv://madeshc129:Sl2AMaWJ4VhToGtx@cluster0.ehrz20r.mongodb.net/userdata?retryWrites=true&w=majority"
const bodyParser = require('body-parser');
const port = 8000
const UserModel = require('./models/Users')

const connectioParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());

mongoose.connect(dbUrl, connectioParams)
    .then(() => {
        console.info('Connected to the Db')
    })
    .catch((e) => {
        console.log('Error :', e)
    })


const storage = multer.memoryStorage()
const uploads = multer({
    storage: storage
})

app.get('/', (req, res) => {
    res.send(
        "<h1> welcome to Server</h1>"
    )
})

// ------------------Sign Up API------------------//
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            username,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ------------------Login Page API------------------//
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserModel.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid login credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// ------------------upload image API------------------//
app.post('/upload-image', uploads.single('image'), async (req, res) => {
    const { base64 } = req.body
    try {
        const { username } = req.body;
        const user = await UserModel.findOne({ username });
        user.images.push({
            image: base64,
            username: username
        });
        await user.save();

        res.status(200).json({ message: 'Image uploaded successfully' });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ------------------get image API------------------//
app.get('/allimages', async (req, res) => {
    try {
        const usersWithImages = await UserModel.find({ images: { $exists: true, $ne: [] } });
        const allImages = usersWithImages.reduce((acc, user) => {
            return [...acc, ...user.images];
        }, []);
        res.status(200).json({ images: allImages });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ------------------like API------------------//
app.post('/like/:imageId', async (req, res) => {
    try {
        const imageId = req.params.imageId;
        const user = await UserModel.findOne({ "images._id": imageId });
        const image = user.images.find(img => img._id == imageId);
        if (image) {
            image.likes += 1;
            await user.save();
            res.json({ success: true, likes: image.likes });
        } else {
            res.status(404).json({ success: false, message: 'Image not found' });
        }
    } catch (error) {
        console.error('Error liking image:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ------------------comment API------------------//
app.post('/comment/:imageId', async (req, res) => {
    try {
        const imageId = req.params.imageId;
        const { text, username } = req.body;
        const users = await UserModel.findOne({ "images._id": imageId });
        const image = users.images.find(img => img._id == imageId);
        image.comments.push({ text, username });
        await users.save();
        res.json({ success: true, comments: image.comments });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.listen(port, () => { console.log("server is Running") })