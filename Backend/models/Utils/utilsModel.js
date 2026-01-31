const connection = require("../db");

class UtilsModel {
  async setStatus(status, username) {
    try {
      if (status) {
        status = 1;
        
      } else {
        status = 0;
        
      }
      let q = `UPDATE users SET status = ? where username = ? `;
      return await new Promise((resolve, reject) => {
        connection.query(q, [status, username], (err, res) => {
          if (err) return reject(err);
          return resolve(JSON.parse(JSON.stringify(res)));
        });
      });
    } catch (error) {
      
      return {
        success: false,
        error: error || "Error in the Utils Model",
      };
    }
  }
}
module.exports = UtilsModel;
