const User = require("../models/User");

class UserRepository{
    async getAllUsers(){
        return await User.find();
    }
    async getUserByID(id){
        return await User.findById(id);
    }
    async getUserByEmail(email){
        return await User.findOne(email);
    }
}

module.exports = new UserRepository();