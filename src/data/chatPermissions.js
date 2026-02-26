/**
 * Chat Permission Rules:
 * - SuperAdmin: Can chat ONLY with Admins
 * - Admin: Can chat with SuperAdmin and Workers in their domain
 * - Worker: Can chat ONLY with their domain Admin
 */

export const chatPermissions = {
  superadmin: {
    canChatWith: ["admin"],
    canViewAllChats: true,
    canDeleteMessages: true,
    description: "Can chat only with Admins",
  },
  admin: {
    canChatWith: ["superadmin", "worker"],
    canViewAllChats: false,
    canDeleteMessages: false,
    description: "Can chat with SuperAdmin and Workers in same domain",
  },
  worker: {
    canChatWith: ["admin"],
    canViewAllChats: false,
    canDeleteMessages: false,
    description: "Can chat only with their domain Admin",
  },
};

/**
 * Get allowed chat users based on current user's role and domain
 * @param {string} currentUserId - Current user ID
 * @param {string} currentUserRole - Current user role
 * @param {string} currentUserDomain - Current user domain (null for superadmin)
 * @param {array} allUsers - List of all available users
 * @returns {array} - Filtered list of users this user can chat with
 */
export const getAllowedChatUsers = (currentUserId, currentUserRole, currentUserDomain, allUsers) => {
  if (!allUsers || allUsers.length === 0) return [];

  const permissions = chatPermissions[currentUserRole];
  if (!permissions) return [];

  return allUsers.filter((user) => {
    // Don't show self
    if (user.id === currentUserId) return false;

    // SuperAdmin: Can chat with any Admin
    if (currentUserRole === "superadmin") {
      return user.role === "admin";
    }

    // Admin: Can chat with SuperAdmin OR Workers in same domain
    if (currentUserRole === "admin") {
      if (user.role === "superadmin") return true;
      if (user.role === "worker" && user.domain === currentUserDomain) return true;
      return false;
    }

    // Worker: Can chat ONLY with their domain Admin
    if (currentUserRole === "worker") {
      return user.role === "admin" && user.domain === currentUserDomain;
    }

    return false;
  });
};

/**
 * Get User Permissions
 * @param {string} role - User role
 * @returns {object} - Permission object for that role
 */
export const getUserPermissions = (role) => {
  return chatPermissions[role] || {};
};