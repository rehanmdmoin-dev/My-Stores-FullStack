const User = require('../../models/user')
const brctpyjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require('../../utils/sendEmail')
const OtpModel = require('../../models/otpmodel')
const transporter = require('../../config/emailConfig')


class AuthController {
  async register(req, res) {
    try {

      const { name, email, phone, password, confirmPassword } = req.body;
      if (!name || !email || !phone || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const UserExist = await User.findOne({ email });
      if (UserExist) {
        return res.status(400).json({ message: "User already exist" });
      }

      const salt = await brctpyjs.genSalt(10);
      const hashPassword = await brctpyjs.hash(password, salt);

      const userdata = new User({
        name,
        email,
        phone,
        password: hashPassword,
      });

      const user = await userdata.save();
      await sendEmail(req, user);

      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(200).json({
        status: true,
        message: "User registered successfully and OTP sent to email for verification",
        data: userResponse,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Unable to register user. Please try again later.",
      });
    }
  }



  async verifyOtp(req, res) {

    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ status: false, message: "All fields are required" });
      }
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res.status(404).json({ status: "failed", message: "Email doesn't exists" });
      }

      if (existingUser.isVerified) {
        return res.status(400).json({ status: false, message: "Email is already verified" });
      }
      const emailVerification = await OtpModel.findOne({ userId: existingUser._id, otp });
      if (!emailVerification) {
        if (!existingUser.isVerified) {
          await sendEmail(req, existingUser);
          return res.status(400).json({ status: false, message: "Invalid OTP, new OTP sent to your email" });
        }
        return res.status(400).json({ status: false, message: "Invalid OTP" });
      }
      const currentTime = new Date();
      const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
      if (currentTime > expirationTime) {
        await sendEmail(req, existingUser);
        return res.status(400).json({ status: "failed", message: "OTP expired, new OTP sent to your email" });
      }
      existingUser.isVerified = true;
      await existingUser.save();

      await OtpModel.deleteMany({ userId: existingUser._id });
      return res.status(200).json({ status: true, message: "Email verified successfully" });


    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Unable to verify email, please try again later" });
    }

  }


  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({
        status: false,
        message: "User does not exist",
      });
    }


    const isMatch = await brctpyjs.compare(password, userExist.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    const token = await jwt.sign({
      id: userExist._id,
      name: userExist.name,
      email: userExist.email,
      phone: userExist.phone,
      role: userExist.role,
    }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = await jwt.sign({
      id: userExist._id,
      name: userExist.name,
      email: userExist.email,
      phone: userExist.phone,
      role: userExist.role,
    }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    const salt = await brctpyjs.genSalt(10);
    const hashedRefreshToken = await brctpyjs.hash(refreshToken, salt);
    userExist.refreshToken = hashedRefreshToken;
    await userExist.save();

    // NOTE: we intentionally do NOT set an httpOnly "token" cookie here.
    // The frontend stores the access token itself (in a JS-readable cookie)
    // right after login and sends it as an "Authorization: Bearer <token>"
    // header, which is what the Auth middleware actually checks.
    // An httpOnly cookie with the same name ("token") would silently block
    // the frontend from ever writing its own readable cookie (browsers
    // refuse to let JS overwrite an httpOnly cookie of the same
    // name/path), so the Authorization header would never get set and
    // every protected request would fail with "Access denied. No token
    // provided" even though login itself succeeded.
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      status: true,
      message: "Login successful",
      user: {
        id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        phone: userExist.phone,
        role: userExist.role,
      },
      token: token,
      refreshToken: refreshToken,
    });
  }

  async logout(req, res) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({
      status: true,
      message: "Logged out successfully",
    });
  }


  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          status: false,
          message: "Refresh token required",
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET || "secrectKey",
        );
      } catch (err) {
        return res.status(403).json({
          status: false,
          message: "Invalid or expired refresh token",
        });
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      if (!user.refreshToken) {
        return res.status(401).json({
          status: false,
          message: "No refresh token found. Please login again.",
        });
      }

      const isMatch = await brctpyjs.compare(refreshToken, user.refreshToken);

      if (!isMatch) {
        return res.status(403).json({
          status: false,
          message: "Refresh token mismatch",
        });
      }

      const newAccessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      const newRefreshToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" },
      );

      const hashedToken = await brctpyjs.hash(newRefreshToken, 10);
      user.refreshToken = hashedToken;
      await user.save();

      return res.status(200).json({
        status: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        message: "Token refreshed successfully",
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server error",
        error: err.message,
      });
    }
  }


  async resetPasswordLink(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ status: false, message: "Email field is required" });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ status: false, message: "Email doesn't exist" });
      }
      const secret = user._id + process.env.JWT_SECRET;
      const tokenLink = jwt.sign({ userID: user._id }, secret, { expiresIn: '20m' });
      const frontendHost = process.env.FRONTEND_HOST || "http://localhost:3000";
      const resetLink = `${frontendHost}/auth/reset-password/${user._id}/${tokenLink}`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset Link",
        html: `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">Click here</a> to reset your password.</p>`
      });

      res.status(200).json({ status: true, message: "Password reset link sent to your email. Please check your email." });

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: false, message: "Unable to send password reset email. Please try again later." });

    }

  }


  async resetPassword(req, res) {
    try {
      const { password, confirm_password } = req.body;
      const { id, token } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(400).json({ status: false, message: "User not found" });
      }

      const new_secret = user._id + process.env.JWT_SECRET;
      jwt.verify(token, new_secret);

      if (!password || !confirm_password) {
        return res.status(400).json({ status: false, message: "New Password and Confirm New Password are required" });
      }

      if (password !== confirm_password) {
        return res.status(400).json({ status: false, message: "New Password and Confirm New Password don't match" });
      }
      const salt = await brctpyjs.genSalt(10);
      const newHashPassword = await brctpyjs.hash(password, salt);

      await User.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } });

      res.status(200).json({ status: "success", message: "Password reset successfully" });

    } catch (error) {
      return res.status(500).json({ status: "failed", message: "Unable to reset password. Please try again later." });
    }
  }

  async dashboard(req, res) {

    return res.status(200).json({
      status: true,
      message: "Dashboard",
      user: req.user,
    });

  }



  async updateProfile(req, res) {
    try {
      const { name, email, phone } = req.body;
      if (!name || !email || !phone) {
        return res.status(400).json({
          status: false,
          message: "All fields are required",
        });
      }

      const userExist = await User.findById(req.user.id);
      if (!userExist) {
        return res.status(400).json({
          status: false,
          message: "User does not exist",
        });
      }

      userExist.name = name;
      userExist.email = email;
      userExist.phone = phone;

      const data = await userExist.save();

      const userResponse = data.toObject();
      delete userResponse.password;

      return res.status(200).json({
        status: true,
        message: "Profile updated successfully",
        data: userResponse,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "something went wrong",
        error: error,
      });
    }
  }


}


module.exports = new AuthController();