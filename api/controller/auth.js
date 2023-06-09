const User = require("../model/User.js");
const { hash, compare } = require("bcrypt")
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const signup = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) return res.status(StatusCodes.BAD_REQUEST).json({
            error: "Confirm password not match! Please check your password again!.",
        });
        const hashedPassword = await hash(password, Number(process.env.SALT_ROUNDS));
        const user = await User.create({ name, email, password: hashedPassword });
        return res.status(StatusCodes.OK).json({ message: "Successfully create new User!", data: user });
    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { password, remember } = req.body;
        const select = "+password";
        const user = await User.findOne({ email: req.body.email }, select);
        if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Cannot find the user by email or password" });
        const match = await compare(password, user.password);
        if (!match) res.status(StatusCodes.UNAUTHORIZED).json({ error: "Password doesn't match" });
        user._id = user._id.toString();
        const accessToken = jwt.sign({ userID: user._id }, process.env.ACCESS_SECRET, {
            expiresIn: '1d'
        });
        if (remember) {
            const refreshToken = jwt.sign({ userID: user._id }, process.env.REFRESH_SECRET, {
                expiresIn: '1d',
            });
            const options = {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),// 30 days
                httpOnly: true
            };
            res.cookie(process.env.WEB_COOKIE_REFRESH_TOKEN, refreshToken, options);
            await User.updateOne({ _id: user._id }, { $set: { refresh_token: refreshToken, } });
        }
        res.status(StatusCodes.OK).json({ message: "Logged in successfully!", data: accessToken })

    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies[process.env.WEB_COOKIE_REFRESH_TOKEN];
        if (!refreshToken) return res.status(StatusCodes.NO_CONTENT).json({ message: "Logging out..." });
        const { userID } = req;
        try {
            await User.updateOne({ _id: userID }, {
                $set: {
                    refresh_token: null,
                }
            })
        }
        finally {
            res.clearCookie(process.env.WEB_COOKIE_REFRESH_TOKEN);
            return res.status(StatusCodes.OK).json({ message: "Logout Successfully!" });
        }
    } catch (error) {
        next(error)
    }
}

const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies[process.env.WEB_COOKIE_REFRESH_TOKEN];
        if (!refreshToken) return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Not logged in at all!" });
        const user = await User.findOne({ refresh_token: refreshToken });
        if (!user) return res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden access! Not user" });
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (!user) return res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden access! Not user" });

            }
            const { _id: userID } = user;
            const accessToken = jwt.sign({ userID }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '5m',
            });

            res.status(StatusCodes.OK).json({ message: "Generated your refresh token successfully!", data: accessToken })
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    refreshToken, logout, login, signup
}