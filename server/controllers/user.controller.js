import User from "../models/userModel.js";

export const getCurrentUser = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({user: user, message: "User found"});
    } catch (error) {
        console.error('GetCurrentUser error', error);
        return res.status(500).json({message: 'Get Current User error'});
    }
}