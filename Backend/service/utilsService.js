const UtilsModel = require("../models/Utils/utilsModel.js");

class UtilsService {
  constructor() {
    this.utilsModel = new UtilsModel();
  }

  async setStatus(status, username) {
    try {
      return await this.utilsModel.setStatus(status, username);
    } catch (error) {
      
      return {
        success: false,
        error: error || "Error in the Utils Service",
      };
    }
  }
}

module.exports = UtilsService;
