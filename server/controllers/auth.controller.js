import genToken from "../config/token";

export const googleAuth = async(req, res) => {
    try {
        const {name, email} = req.body;
        let user = await User.findOne(email);
        if(!user) {
            user = await User.create({
                name: name,
                email: email,
            });
        }
        let token = await genToken(user._id);
    } catch (error) {
        
    }
}