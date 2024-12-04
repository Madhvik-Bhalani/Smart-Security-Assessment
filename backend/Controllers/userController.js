const userModel = require("../Models/userModel.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


exports.signup = async (req, res) => {
    try {

        const user = await userModel.findOne({ email: req.body?.email });

        if ((user) && (user.active == false)) {

            const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET_KEY)

            const hashedPassword = await bcrypt.hash(req.body.pass, 10);

            await userModel.updateOne({ email: user.email }, { $set: { fname: req.body.fname, lname: req.body.lname, email: req.body.email, pass: hashedPassword, active: true, token: token } }, { new: true })
            //Update the data for the already existing email ID whose account has been deleted.

            res.status(201).json({
                status: true,
                message: "Signup successfully..!",
                data: token,
            });
        }
        else if (user !== null) {
            return res.status(400).json({
                status: false,
                message: "User already exist..!",
            });
        }
        else {
            if (req.body.pass === req.body.cpass) {

                const data = new userModel({
                    fname: req.body.fname,
                    lname: req.body.lname,
                    email: req.body.email,
                    mno: req.body.mno,
                    pass: req.body.pass
                })

                const token = await data.gentoken();


                await data.save();  // password will be bcrypted using function which is define in userModel

                await userModel.updateOne({ email: req.body.email }, { $set: { token: token } }, { new: true });
                //first save and then update


                res.status(201).json({
                    status: true,
                    message: "Signup successfully..!",
                    data: token,
                });

            } else {
                res.status(400).json({
                    status: false,
                    message: "Password and confirm password does not match..!",
                });

            }
        }

    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
        });
    }
}


exports.signin = async (req, res) => {
    try {
        const data = await userModel.findOne({ email: req.body.email });
        if (data && data.active == true) {
            const valid = await bcrypt.compare(req.body.pass, data.pass);
            if (valid) {
                const token = await data.gentoken();

                await userModel.updateOne({ email: req.body.email }, { $set: { token: token } }, { new: true });

                res.status(200).json({
                    status: true,
                    message: "Signin successfully..!",
                    data: token,
                });

            } else {
                res.status(400).json({
                    status: false,
                    message: "Your detail does not match..!",
                });
            }
        } else {
            res.status(400).json({
                status: false,
                message: "Your account does not exist, Please signup first..!",
            });
        }
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
        });
    }
};