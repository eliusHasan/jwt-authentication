const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require("path");
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');


dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials:true,
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));                       

app.use('/api/auth',authRoutes);
app.get('/', (req,res) => {
    const token = req.cookies.token;
    const loggedIn = !!token;
    res.render("home",{loggedIn});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
