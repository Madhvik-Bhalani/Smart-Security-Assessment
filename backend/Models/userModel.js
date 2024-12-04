const mongoose = require("mongoose");
const unival = require("mongoose-unique-validator")
const validator = require("validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: [true, "Please fill your first name"],
    },
    lname: {
        type: String,
        required: [true, "Please fill your last name"],
    },
    email: {
        type: String,
        required: [true, " Please fill your email"],
        unique: true,
        lowercase: true,

        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error("Email is not valid");
            }
        }
    },
    pass: {
        type: String,
        required: [true, "Please fill your password"],
    },
    token: {
        type: String
    },
    active: {
        type: Boolean,
        default: true,
    }
},
    { timestamps: true }
);
userSchema.plugin(unival)

// encrypt password before save
userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("pass")) {
            const hashedPassword = await bcrypt.hash(this.pass, 10);
            this.pass = hashedPassword;
        }
        next();
    } catch (error) {
        console.error("Password hashing error:", error);
        next(error);
    }
});

//generate json web token for user
userSchema.methods.gentoken = async function () {

    try {
        const token = await jwt.sign({ _id: this._id }, process.env.TOKEN_SECRET_KEY)
        return token;
    } catch (error) {

        console.log(`json web token generate err` + error);
    }
}

module.exports = mongoose.model("User", userSchema, "users");