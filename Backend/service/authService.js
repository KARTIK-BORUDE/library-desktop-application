const authModel = require("../models/AuthModel/auth");

class AuthService {
  async signin(username, password) {
    try {
      return await authModel.signin(username, password);
    } catch (error) {
      console.error("Error in login:", error);
      return { success: false, message: "Login Failed" };
    }
  }
}

module.exports = new AuthService();
