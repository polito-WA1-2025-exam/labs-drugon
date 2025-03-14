function UserCollection() {
    this.users = [];
    this.lastId = 0;
    
    // Add a new user
    this.addUser = function(username, email) {
      const id = ++this.lastId;
      const newUser = new User(id, username, email);
      this.users.push(newUser);
      return newUser;
    };
    
    // Get user by ID
    this.getUserById = function(id) {
      return this.users.find(user => user.id === id);
    };
    
    // Get user by username
    this.getUserByUsername = function(username) {
      return this.users.find(user => user.username === username);
    };
    
    // Remove a user
    this.removeUser = function(id) {
      const index = this.users.findIndex(user => user.id === id);
      if (index !== -1) {
        this.users.splice(index, 1);
        return true;
      }
      return false;
    };
  }