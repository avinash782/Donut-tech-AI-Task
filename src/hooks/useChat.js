import { useState, useEffect, useCallback } from "react";
import { mockChatUsers } from "../data/chatMock";
import { getAllowedChatUsers } from "../data/chatPermissions";

const STORAGE_KEY = "app_chat_conversations_v1";
const API_BASE = (typeof window !== "undefined" && window.__CHAT_API_BASE__) || "http://localhost:4000/api";

const loadLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveLocal = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

export const useChat = (currentUser, currentRole, currentDomain) => {
  const [conversations, setConversations] = useState([]);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [serverAvailable, setServerAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !currentRole) {
      setAllowedUsers([]);
      return;
    }
    setAllowedUsers(getAllowedChatUsers(currentUser.id, currentRole, currentDomain, mockChatUsers));
  }, [currentUser, currentRole, currentDomain]);

  // Load conversations from MongoDB on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetch(`${API_BASE}/conversations`);
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
        saveLocal(Array.isArray(data) ? data : []);
        setServerAvailable(true);
      } catch (error) {
        console.warn("MongoDB unavailable, using local storage:", error.message);
        setConversations(loadLocal());
        setServerAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);



  const participantsKey = (a, b) => [a, b].slice().sort().join("__");

  const sendMessage = useCallback(
    async (receiverId, content) => {
      if (!currentUser || !receiverId || !content.trim()) return false;

      const payload = {
        senderId: currentUser.id,
        receiverId,
        content: content.trim(),
      };

      // Try to save to MongoDB
      if (serverAvailable) {
        try {
          const res = await fetch(`${API_BASE}/conversations/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error("Server save failed");
          const conv = await res.json();
          setConversations((prev) => {
            const others = prev.filter((c) => c.key !== conv.key);
            const next = [...others, conv];
            saveLocal(next);
            return next;
          });
          return true;
        } catch (error) {
          console.warn("MongoDB error, falling back to local:", error.message);
          setServerAvailable(false);
          // Fall through to local storage
        }
      }

      // Local storage fallback
      try {
        const newMsg = {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          receiverId,
          content,
          timestamp: new Date().toISOString(),
          read: false,
        };

        const key = participantsKey(currentUser.id, receiverId);
        setConversations((prev) => {
          const prevCopy = Array.isArray(prev) ? [...prev] : [];
          let conv = prevCopy.find((c) => c.key === key);

          if (!conv) {
            conv = {
              id: `conv-${Date.now()}`,
              key,
              participants: [currentUser.id, receiverId],
              messages: [newMsg],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            prevCopy.push(conv);
          } else {
            conv.messages.push(newMsg);
            conv.updatedAt = new Date().toISOString();
          }

          saveLocal(prevCopy);
          return prevCopy;
        });
        return true;
      } catch (error) {
        console.error("Local save error:", error);
        return false;
      }
    },
    [currentUser, serverAvailable]
  );

  const getConversation = useCallback(
    (otherUserId) => {
      if (!currentUser || !otherUserId) return null;
      const key = participantsKey(currentUser.id, otherUserId);
      return conversations.find((c) => c.key === key) || null;
    },
    [currentUser, conversations]
  );

  const markRead = useCallback(
    async (otherUserId) => {
      if (!currentUser || !otherUserId) return;

      const key = participantsKey(currentUser.id, otherUserId);

      if (serverAvailable) {
        try {
          const res = await fetch(`${API_BASE}/conversations/${key}/read`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id }),
          });

          if (res.ok) {
            const updated = await res.json();
            setConversations((prev) => {
              const others = prev.filter((c) => c.key !== updated.key);
              return [...others, updated];
            });
            return;
          }
        } catch (error) {
          console.warn("Could not mark as read on server:", error.message);
        }
      }

      // Local fallback
      const next = conversations.map((c) => {
        if (c.key !== key) return c;
        const updated = {
          ...c,
          messages: c.messages.map((m) =>
            m.receiverId === currentUser.id ? { ...m, read: true } : m
          ),
          updatedAt: new Date().toISOString(),
        };
        return updated;
      });
      setConversations(next);
      saveLocal(next);
    },
    [currentUser, conversations, serverAvailable]
  );

  return {
    conversations,
    allowedUsers,
    sendMessage,
    getConversation,
    markRead,
    serverAvailable,
    loading,
  };
};