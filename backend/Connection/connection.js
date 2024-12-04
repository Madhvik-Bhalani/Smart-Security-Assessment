const mongoose = require("mongoose")

const conn = async () => {
    try {
        mongoose.connect(process.env.DATABASE_CON_URI)
        console.log(`MongoDB Connected..!!`);
    } catch (error) {
        console.log(`MongoDB Connection error` + error);
    }
}

conn()