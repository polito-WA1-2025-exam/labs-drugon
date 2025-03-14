// /models/User.js
class User {
    constructor(id, username, password, role) {
      this.id = id;
      this.username = username;
      this.password = password; // or passwordHash
      this.role = role;         // e.g., "customer" or "admin"
    }
  }
  
  export default User;
  