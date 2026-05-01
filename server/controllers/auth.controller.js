import genToken from "../config/token.js";
import User from "../models/userModel.js";

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    let user = await User.findOne({ email }); 

    if (!user) {
      user = await User.create({ name, email });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      user,
      message: "Authentication successful"
    });

  } catch (error) {
    console.error("Error in googleAuth:", error); 
    return res.status(500).json({
      message: `Google Auth Error: ${error.message}`
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    return res.status(200).json({
      message: "Logout successful"
    });

  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({
      message: `Logout Error: ${error.message}`
    });
  }
};