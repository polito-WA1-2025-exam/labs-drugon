import User from '../models/User.js';

class UserCollection {
    constructor() {
        this.users = [];
        this.lastId = 0;
    }
    
    // Add a new user
    addUser(username, email) {
        const id = ++this.lastId;
        const newUser = new User(id, username, email);
        this.users.push(newUser);
        return newUser;
    }
    
    // Get user by ID
    getUserById(id) {
        return this.users.find(user => user.id === id);
    }
    
    // Get user by username
    getUserByUsername(username) {
        return this.users.find(user => user.username === username);
    }
    
    // Remove a user
    removeUser(id) {
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }
}

export default UserCollection;