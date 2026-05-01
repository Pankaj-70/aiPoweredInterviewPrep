import mongoose from "mongoose"

const connectDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("DB connected successfully")
    } catch (error) {
        console.error("Error in mongodb connection: ", error)
    }
}

export default connectDb;