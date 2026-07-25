import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

export async function register(req, res) {
    console.log("REQ BODY:", req.body);

    let { username, email, password } = req.body;

    username = username?.trim();
    email = email?.trim().toLowerCase();

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Username, email and password are required",
            success: false,
        });
    }

    const isuserAlreadyexists = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isuserAlreadyexists) {
        return res.status(400).json({
            message: "Username or email already exists",
            success: false,
            err: "user Already Exists"
        });
    }

    const user = await userModel.create({ username, email, password });

    const emailverificationToken = jwt.sign({
        email: user.email,
    }, process.env.JWT_SECRET);

    try {
        await sendEmail({
            to: email,
            subject: "Welcome to Perplexity!",
            html: `<h1>Welcome to Perplexity, ${username}!</h1><p>Thank you for registering. We're excited to have you on board!</p>
                   <p>Best regards,<br/>The Perplexity Team</p>
                   <p>To verify your email address, please click the link below:</p>
                    <a href="${process.env.BACKEND_URL}/api/auth/verify-email?token=${emailverificationToken}">Verify Email</a>
                    <p>If you have any questions or need assistance, feel free to contact our support team.</p>`,
            text: `Welcome to Perplexity, ${username}! Thank you for registering. We're excited to have you on board! Best regards, The Perplexity Team. If you have any questions or need assistance, feel free to contact our support team.`
        });
    } catch (emailError) {
        console.error("Failed to send verification email:", emailError.message);
        // Registration still succeeds even if email fails
    }

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });

}

export async function login(req, res) {

    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "User not found"
        });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "Incorrect password"
        });
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "Email not verified",
            success: false,
            err: "Please verify your email before logging in"
        });
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email,
    }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
        message: "Login successful",
        success: true,

        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });
}

export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        });
    }

    res.status(200).json({
        message: "User fetched successfully",
        success: true,
        user,
    });

}

export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "Invalid token"
            });
        }

        user.verified = true;

        await user.save();

        const html = `<h1>Email Verified</h1><p>Your email has been successfully verified. You can now log in to your account.</p>`;

        res.send(html);
    }
    catch (error) {
        return res.status(400).json({
            message: "Invalid token",
            success: false,
            err: "Invalid token"
        });
    }
}