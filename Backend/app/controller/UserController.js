const User=require('../models/user')



class UserController {
    async userCreate(req, res) {
        try {
            const { name, email, phone, password, confirmPassword } = req.body;
           
            const user=new User({
                name,
                email,
                phone,
                password,
                confirmPassword
            })

            const result = await user.save();
            res.status(201).json({ message: "User created successfully", result });

        } catch (error) {
            res.status(500).json({ message: "Error creating user", error });
        }
    }
}


module.exports = new UserController();