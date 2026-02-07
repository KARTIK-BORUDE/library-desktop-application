const axios = require("axios");

class Auth {
  constructor() {
    this.baseUrl = "http://localhost:2150";
  }
  async signin(username, password) {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/sign-in`, {
        username,
        password,
      });
      if (response.data.success) {
        return response.data;
      }
      console.log("Response In Auth Model :::", response);
    } catch (error) {
      console.error("Error in login:", error);
      return { success: false, message: "Login Failed" };
    }
  }
}

module.exports = new Auth();
