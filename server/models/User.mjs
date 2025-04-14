// /models/User.mjs

export default function User() {
    // Create a new user
    this.createUser = (id = null, username, password, email, fullName) => {
        return {
            id,              // Will be set by the collection
            username,
            password,        // Will be hashed before storage
            email,
            fullName,
            createdAt: new Date()
        };
    };

    // Validate user data
    this.validateUser = (user) => {
        // ID check is now optional since it will be set by the collection
        if (user.id !== null && (typeof user.id !== 'number' || user.id < 1)) {
            throw new Error('Invalid user ID');
        }
        
        if (!user.username || typeof user.username !== 'string' || user.username.trim() === '') {
            throw new Error('Invalid username');
        }
        
        if (!user.password || typeof user.password !== 'string' || user.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        if (!user.email || typeof user.email !== 'string' || !user.email.includes('@')) {
            throw new Error('Invalid email address');
        }

        if (!user.fullName || typeof user.fullName !== 'string' || user.fullName.trim() === '') {
            throw new Error('Invalid full name');
        }
        
        return true;
    };

    // Format user for display (exclude sensitive data)
    this.formatUser = (user) => {
        const { password, ...safeUser } = user;
        return {
            ...safeUser,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
        };
    };

    // Hash password (in a real app, use a proper hashing library)
    this.hashPassword = async (password) => {
        // This is just a placeholder. In a real app, use bcrypt or similar
        return `hashed_${password}`;
    };

    // Verify password (in a real app, use proper verification)
    this.verifyPassword = async (password, hashedPassword) => {
        // This is just a placeholder. In a real app, use bcrypt or similar
        return `hashed_${password}` === hashedPassword;
    };
}; 