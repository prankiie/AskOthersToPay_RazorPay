/**
 * Mock user data - family scenario
 * Represents users who request payments and approve them
 */
const mockUsers = {
  'USER_001': {
    id: 'USER_001',
    name: 'Priya Sharma',
    phone: '+91-9876543210',
    upiId: 'priya.sharma@upi',
    email: 'priya@example.com',
    relationship: 'Daughter',
    createdAt: '2023-01-15T00:00:00Z'
  },

  'USER_002': {
    id: 'USER_002',
    name: 'Rajesh Sharma',
    phone: '+91-9876543211',
    upiId: 'rajesh.sharma@upi',
    email: 'rajesh@example.com',
    relationship: 'Father',
    createdAt: '2023-01-15T00:00:00Z'
  },

  'USER_003': {
    id: 'USER_003',
    name: 'Anjali Sharma',
    phone: '+91-9876543212',
    upiId: 'anjali.sharma@upi',
    email: 'anjali@example.com',
    relationship: 'Mother',
    createdAt: '2023-01-15T00:00:00Z'
  },

  'USER_004': {
    id: 'USER_004',
    name: 'Arjun Sharma',
    phone: '+91-9876543213',
    upiId: 'arjun.sharma@upi',
    email: 'arjun@example.com',
    relationship: 'Brother',
    createdAt: '2023-01-15T00:00:00Z'
  },

  'USER_005': {
    id: 'USER_005',
    name: 'Vikram Patel',
    phone: '+91-9876543214',
    upiId: 'vikram.patel@upi',
    email: 'vikram@example.com',
    relationship: 'Friend',
    createdAt: '2023-02-20T00:00:00Z'
  },

  'USER_006': {
    id: 'USER_006',
    name: 'Neha Gupta',
    phone: '+91-9876543215',
    upiId: 'neha.gupta@upi',
    email: 'neha@example.com',
    relationship: 'Sister',
    createdAt: '2023-03-10T00:00:00Z'
  }
};

/**
 * Get user by ID
 */
function getUser(userId) {
  return mockUsers[userId] || null;
}

/**
 * Get all users
 */
function getAllUsers() {
  return Object.values(mockUsers);
}

/**
 * Validate user exists
 */
function userExists(userId) {
  return !!mockUsers[userId];
}

/**
 * Get user by UPI ID
 */
function getUserByUpiId(upiId) {
  return Object.values(mockUsers).find(user => user.upiId === upiId) || null;
}

module.exports = {
  mockUsers,
  getUser,
  getAllUsers,
  userExists,
  getUserByUpiId
};
