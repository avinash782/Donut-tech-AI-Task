// Store conversations temporarily (will migrate to MongoDB later)
export const chatConversations = [
  {
    id: "conv-001",
    participants: ["admin-hr-001", "sa-001"],
    messages: [
      {
        id: "msg-001",
        senderId: "admin-hr-001",
        senderName: "Sarah Johnson",
        receiverId: "sa-001",
        content: "Hi, I have an update on HR tasks",
        timestamp: new Date("2024-02-10T09:00:00Z"),
        read: true,
      },
      {
        id: "msg-002",
        senderId: "sa-001",
        senderName: "Super Admin",
        receiverId: "admin-hr-001",
        content: "Thanks for the update. Keep me posted.",
        timestamp: new Date("2024-02-10T09:05:00Z"),
        read: true,
      },
    ],
  },
];

// Mock users across all roles with domain info
export const mockChatUsers = [
  // SUPERADMIN
  {
    id: "sa-001",
    name: "Super Admin",
    email: "superadmin@example.com",
    role: "superadmin",
    domain: null,
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FF6B6B'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='white'%3ESA%3C/text%3E%3C/svg%3E",
    status: "online",
  },

  // ADMINS WITH DOMAINS
  {
    id: "admin-hr-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "admin",
    domain: "HR",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234A90E2'/%3E%3Ctext x='50' y='60' font-size='35' text-anchor='middle' fill='white'%3ESJ%3C/text%3E%3C/svg%3E",
    status: "online",
  },
  {
    id: "admin-acc-001",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    role: "admin",
    domain: "Accounts",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2350C878'/%3E%3Ctext x='50' y='60' font-size='35' text-anchor='middle' fill='white'%3EMC%3C/text%3E%3C/svg%3E",
    status: "offline",
  },
  {
    id: "admin-it-001",
    name: "David Martinez",
    email: "david.martinez@example.com",
    role: "admin",
    domain: "IT",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FFD700'/%3E%3Ctext x='50' y='60' font-size='35' text-anchor='middle' fill='%23333'%3EDM%3C/text%3E%3C/svg%3E",
    status: "online",
  },

  // WORKERS WITH DOMAINS
  {
    id: "worker-001",
    name: "Alice Thompson",
    email: "alice.thompson@example.com",
    role: "worker",
    domain: "HR",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%239B59B6'/%3E%3Ctext x='50' y='60' font-size='35' text-anchor='middle' fill='white'%3EAT%3C/text%3E%3C/svg%3E",
    status: "online",
  },
  {
    id: "worker-002",
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    role: "worker",
    domain: "HR",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23E74C3C'/%3E%3Ctext x='50' y='60' font-size='35' text-anchor='middle' fill='white'%3EBW%3C/text%3E%3C/svg%3E",
    status: "offline",
  },
  {
    id: "worker-003",
    name: "Carol Davis",
    email: "carol.davis@example.com",
    role: "worker",
    domain: "Accounts",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%231ABC9C'/%3E%3Ctext x='50' y='60' font-size='35' text-anchor='middle' fill='white'%3ECD%3C/text%3E%3C/svg%3E",
    status: "online",
  },
  {
    id: "worker-004",
    name: "Edward Harris",
    email: "edward.harris@example.com",
    role: "worker",
    domain: "IT",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%233498DB'/%3E%3Ctext x='50' y='60' font-size='35' text-anchor='middle' fill='white'%3EEH%3C/text%3E%3C/svg%3E",
    status: "online",
  },
];