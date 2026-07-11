import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../lib/mailer.js";

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" needed for cross-origin in prod, "lax" works for dev via proxy
	};

	res.cookie("accessToken", accessToken, {
		...cookieOptions,
		maxAge: 15 * 60 * 1000,
	});
	res.cookie("refreshToken", refreshToken, {
		...cookieOptions,
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
};

export const signup = async (req, res) => {
	const { email, password, firstName, lastName } = req.body;
	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ firstName, lastName, email, password });

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		const userResponse = {
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			phone: user.phone,
			addresses: user.addresses,
			cartItems: user.cartItems
		};

		res.status(201).json(userResponse);
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const { accessToken, refreshToken } = generateTokens(user._id);
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			const userResponse = {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				role: user.role,
				phone: user.phone,
				addresses: user.addresses,
				cartItems: user.cartItems
			};

			res.json(userResponse);
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

		if (storedToken !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const userResponse = {
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			phone: user.phone,
			addresses: user.addresses,
			cartItems: user.cartItems
		};

		res.json(userResponse);
	} catch (error) {
		console.error("Error in getProfile:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const { firstName, lastName, email, phone, addresses, currentPassword, newPassword } = req.body;
		const user = await User.findById(req.user._id);

		// Update basic info
		if (firstName) user.firstName = firstName;
		if (lastName) user.lastName = lastName;
		if (email) user.email = email;
		if (phone !== undefined) user.phone = phone;
		if (addresses !== undefined) user.addresses = addresses;

		// Update password if provided
		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) {
				return res.status(400).json({ message: "Current password is incorrect" });
			}
			user.password = await bcrypt.hash(newPassword, 10);
		}

		await user.save();
		
		// Return updated user without password
		const userResponse = {
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			phone: user.phone,
			addresses: user.addresses,
			cartItems: user.cartItems
		};
		res.json(userResponse);
	} catch (error) {
		console.error("Error in updateProfile:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const requestPasswordReset = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ message: "Email is required" });
		}

		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			return res.status(404).json({ message: "No account found with that email" });
		}

		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

		user.resetPasswordToken = resetTokenHash;
		user.resetPasswordExpiresAt = expiresAt;
		await user.save();

		const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
		const resetUrl = `${frontendUrl}/forgot-password?token=${resetToken}`;

		try {
			await sendPasswordResetEmail({
				to: user.email,
				resetUrl
			});

			res.json({
				success: true,
				message: "If an account exists, a reset link has been sent to your email."
			});
		} catch (emailError) {
			console.error("Failed to send password reset email:", emailError.message);
			res.json({
				success: true,
				message: process.env.NODE_ENV === "production"
					? "The reset link was generated, but email delivery is not configured on this server."
					: "The reset link was generated. Use the link below for testing.",
				resetUrl,
				token: resetToken
			});
		}
	} catch (error) {
		console.error("Error in requestPasswordReset:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token, newPassword } = req.body;
		if (!token || !newPassword) {
			return res.status(400).json({ message: "Token and new password are required" });
		}

		const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
		const user = await User.findOne({
			resetPasswordToken: resetTokenHash,
			resetPasswordExpiresAt: { $gt: Date.now() }
		});

		if (!user) {
			return res.status(400).json({ message: "Invalid or expired reset token" });
		}

		user.password = newPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		res.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		console.error("Error in resetPassword:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
