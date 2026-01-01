/**
 * User Model
 * In-memory storage for demonstration purposes
 * In production, replace with a database like MongoDB or PostgreSQL
 */

class User {
  constructor(id, name, email, password, userType, profilePicture = null) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password; // Will store hashed password
    this.userType = userType; // 'creator' or 'viewer'
    this.profilePicture = profilePicture;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

// In-memory storage (replace with database in production)
const users = [];
let nextId = 1;

/**
 * User Repository - handles all user data operations
 */
export const UserRepository = {
  /**
   * Create a new user
   */
  create(userData) {
    const user = new User(
      nextId++,
      userData.name,
      userData.email,
      userData.password,
      userData.userType,
      userData.profilePicture
    );
    users.push(user);
    return user;
  },

  /**
   * Find user by email
   */
  findByEmail(email) {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  },

  /**
   * Find user by ID
   */
  findById(id) {
    return users.find(user => user.id === id);
  },

  /**
   * Get all users (for admin purposes)
   */
  getAll() {
    return users;
  },

  /**
   * Update user
   */
  update(id, updates) {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date()
    };
    return users[userIndex];
  },

  /**
   * Delete user
   */
  delete(id) {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    users.splice(userIndex, 1);
    return true;
  },

  /**
   * Get user without password field (for safe responses)
   */
  getSafeUser(user) {
    if (!user) return null;
    
    const { password, ...safeUser } = user;
    return safeUser;
  }
};

export default User;
