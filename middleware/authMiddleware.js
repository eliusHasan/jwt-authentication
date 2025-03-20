const jwt = require('jsonwebtoken');

const authMiddleware = (req,res,next) => {
    const token = req.cookies.token;
    if(!token) return res.render("protected", {msg: "Please, Log in first", loggedIn: false});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({message: 'Invalid Token'})
    }
}

module.exports = authMiddleware;