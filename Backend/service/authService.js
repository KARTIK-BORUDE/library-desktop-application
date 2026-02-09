const authModel = require("../models/AuthModel/auth");

class AuthService {
  async signIn(username, password) {
    try {
      return await authModel.signIn(username, password);
    } catch (error) {
      console.error("Error in login:", error);
      return { success: false, message: error.response.data.message };
    }
  }
  async signUser(username, password) {
    try {
      const user = await authModel.signup(username, password);
      if (user.success) {
        return user;
      } else {
        return { success: false, message: user.message };
      }
    } catch (error) {
      console.error("Error in signup:", error);
      return { success: false, message: error.data.message };
    }
  }
}

module.exports = new AuthService();
