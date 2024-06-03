const UserModel = require("../models/userModel");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// primary purpose is to simplify error handling in asynchronous route handlers and
// middleware by automatically catching errors and passing them to the next middleware function.
const asyncHandle = require('express-async-handler')
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.USERNAME_EMAIL,
        pass: process.env.PASSWORD_EMAIL,
    },
});

const getJsonWebToken = async (email, id) => {
    // console.log(email, id);

    const payload = {
        email, id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: '7d'
    })

    return token;
}

const handleSendMail = async (val) => {
    try {
        await transporter.sendMail(val);

        return 'OK';
    } catch (error) {
        return error;
    }
};

const verification = asyncHandle(async (req, res) => {
    const { email } = req.body;

    const verificationCode = Math.round(1000 + Math.random() * 9000);

    try {
        const data = {
            from: `"Support EventHub Appplication" <${process.env.USERNAME_EMAIL}>`,
            to: email,
            subject: 'Verification email code',
            text: 'Your code to verification email',
            html: `<h1>${verificationCode}</h1>`,
        };

        await handleSendMail(data);

        res.status(200).json({
            message: 'Send verification code successfully!!!',
            data: {
                code: verificationCode,
            },
        });
    } catch (error) {
        res.status(401);
        throw new Error('Can not send email');
    }
});

const register = asyncHandle(async (req, res) => {
    // console.log(req.body) //to see what user send to backend from front end

    const { email, fullName, password } = res.body;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
        // return right away as res.status
        res.status(401)
        throw new Error('User has already existed!')
    }

    // encrypt the password
    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new UserModel({
        email,
        fullName: fullName ?? "",
        password: hashedPassword
    })

    // Mongoose method to save data to db
    await newUser.save()

    res.status(200).json({
        message: "Registered successfully",
        data: {
            email: newUser.email,
            id: newUser.id,
            accessToken: await getJsonWebToken(email, newUser.id),
        },
    })
})

const login = asyncHandle(async (req, res) => {

    // console.log(req.body)
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
        res.status(403)
        throw new Error('User not found')
        // return next(new Error('User not found')) pass to next errorHandler
    }

    const isMatchPassword = await bcrypt.compare(password, existingUser.password)

    if (!isMatchPassword) {
        res.status(401)
        throw new Error('email or password is not correct!')
    }

    res.status(200).json({
        message: 'Login successfully',
        data: {
            id: existingUser.id,
            email: existingUser.email,
            accessToken: await getJsonWebToken(email, existingUser.id)
        }
    })

    // res.send something so front end can process
    // res.send('fafa')
})

const forgotPassword = asyncHandle(async (req, res) => {
	const { email } = req.body;

	const randomPassword = Math.round(100000 + Math.random() * 99000);

	const data = {
		from: `"New Password" <${process.env.USERNAME_EMAIL}>`,
		to: email,
		subject: 'Verification email code',
		text: 'Your code to verification email',
		html: `<h1>${randomPassword}</h1>`,
	};

	const user = await UserModel.findOne({ email });
	if (user) {
		const salt = await bcrypt.genSalt(10);

        // hash randomPassword has to be a string not number
		const hashedPassword = await bcrypt.hash(`${randomPassword}`, salt);

		await UserModel.findByIdAndUpdate(user._id, {
			password: hashedPassword,
			isChangePassword: true,
		})
			.then(() => {
				console.log('Done');
			})
			.catch((error) => console.log(error));

		await handleSendMail(data)
			.then(() => {
				res.status(200).json({
					message: 'Send email new password successfully!!!',
					data: [],
				});
			})
			.catch((error) => {
				res.status(401);
				throw new Error('Can not send email');
			});
	} else {
		res.status(401);
		throw new Error('User not found!!!');
	}
});

module.exports = {
    register,
    login,
    verification,
    forgotPassword
}
