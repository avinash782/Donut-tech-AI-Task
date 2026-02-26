import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../config/SupabaseClient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch all allowed contacts for the current user based on role & domain.
 * Rules:
 *  - super_admin → all admins
 *  - admin       → super_admins + all admins (cross-domain) + same-domain workers
 *  - worker      → same-domain admin + same-domain workers (excluding self)
 */
export const fetchAllowedContacts = async (currentEmail, currentRole, currentDomain) => {
    const contacts = [];
    try {
        if (currentRole === "super_admin" || currentRole === "superadmin") {
            const { data: admins } = await supabase.from("admin").select("id, name, email, domain");
            admins?.forEach((a) => contacts.push({ ...a, role: "admin", displayRole: "Admin" }));

        } else if (currentRole === "admin") {
            // 1. Super admins
            const { data: superAdmins } = await supabase.from("super_admin").select("id, name, email");
            superAdmins?.forEach((sa) => contacts.push({ ...sa, role: "super_admin", displayRole: "Super Admin", domain: null }));

            // 2. All admins cross-domain (exclude self)
            const { data: admins } = await supabase.from("admin").select("id, name, email, domain").neq("email", currentEmail);
            admins?.forEach((a) => contacts.push({ ...a, role: "admin", displayRole: "Admin" }));

            // 3. Same-domain workers
            if (currentDomain) {
                const { data: workers } = await supabase.from("worker").select("id, name, email, domain").eq("domain", currentDomain);
                workers?.forEach((w) => contacts.push({ ...w, role: "worker", displayRole: "Worker" }));
            }

        } else if (currentRole === "worker") {
            if (currentDomain) {
                // 1. Same-domain admins
                const { data: admins } = await supabase.from("admin").select("id, name, email, domain").eq("domain", currentDomain);
                admins?.forEach((a) => contacts.push({ ...a, role: "admin", displayRole: "Admin" }));

                // 2. Same-domain workers (exclude self)
                const { data: workers } = await supabase.from("worker").select("id, name, email, domain").eq("domain", currentDomain).neq("email", currentEmail);
                workers?.forEach((w) => contacts.push({ ...w, role: "worker", displayRole: "Worker" }));
            }
        }
    } catch (err) {
        console.error("[fetchAllowedContacts] Error:", err);
    }
    return contacts;
};

/**
 * Fetch current user's info (name, domain) from the correct role table.
 */
export const fetchCurrentUserInfo = async (email, role) => {
    const tableName =
        role === "super_admin" || role === "superadmin" ? "super_admin"
            : role === "admin" ? "admin"
                : "worker";

    const { data, error } = await supabase
        .from(tableName)
        .select("id, name, email, domain")
        .eq("email", email)
        .single();

    if (error) { console.warn("[fetchCurrentUserInfo]", error.message); return null; }
    return data;
};

// ─── Main Hook ────────────────────────────────────────────────────────────────

export const useChatSupabase = (currentUser, currentRole, currentDomain) => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const channelRef = useRef(null);
    const selectedRef = useRef(selectedContact); // keep latest value in closures

    useEffect(() => { selectedRef.current = selectedContact; }, [selectedContact]);

    const currentEmail = currentUser?.email;

    // ─── Current user info ────────────────────────────────────────────────────
    useEffect(() => {
        if (!currentEmail || !currentRole) return;
        fetchCurrentUserInfo(currentEmail, currentRole).then(setUserInfo);
    }, [currentEmail, currentRole]);

    // ─── Contacts ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!currentEmail || !currentRole) { setContacts([]); setLoadingContacts(false); return; }
        setLoadingContacts(true);
        fetchAllowedContacts(currentEmail, currentRole, currentDomain).then((c) => {
            setContacts(c);
            setLoadingContacts(false);
        });
    }, [currentEmail, currentRole, currentDomain]);

    // ─── Load messages for a conversation ────────────────────────────────────
    const loadMessages = useCallback(async (contactEmail) => {
        if (!currentEmail || !contactEmail) return;
        setLoadingMessages(true);
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .or(
                `and(sender_email.eq.${currentEmail},receiver_email.eq.${contactEmail}),` +
                `and(sender_email.eq.${contactEmail},receiver_email.eq.${currentEmail})`
            )
            .order("created_at", { ascending: true });

        if (error) { console.error("[loadMessages]", error.message); }
        else { setMessages(data || []); }
        setLoadingMessages(false);
    }, [currentEmail]);

    // ─── Realtime subscription ────────────────────────────────────────────────
    useEffect(() => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
        if (!selectedContact || !currentEmail) return;

        const contactEmail = selectedContact.email;
        loadMessages(contactEmail);

        const isRelevant = (msg) =>
            (msg.sender_email === currentEmail && msg.receiver_email === contactEmail) ||
            (msg.sender_email === contactEmail && msg.receiver_email === currentEmail);

        const channel = supabase
            .channel(`chat-${[currentEmail, contactEmail].sort().join("-")}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
                const msg = payload.new;
                if (!isRelevant(msg)) return;
                setMessages((prev) => {
                    // Replace optimistic placeholder OR add new message (avoid duplicates by real id)
                    const hasReal = prev.find((m) => m.id === msg.id);
                    if (hasReal) return prev.map((m) => m.id === msg.id ? { ...m, ...msg } : m);
                    // Remove any optimistic clone of this message (same text + sender + receiver sent within 5s)
                    const filtered = prev.filter(
                        (m) => !(m._optimistic && m.sender_email === msg.sender_email && m.message === msg.message)
                    );
                    return [...filtered, msg];
                });
            })
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
                const msg = payload.new;
                setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, ...msg } : m));
            })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, (payload) => {
                const id = payload.old.id;
                setMessages((prev) => prev.filter((m) => m.id !== id));
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
        };
    }, [selectedContact, currentEmail, loadMessages]);

    // ─── Send Message (with optimistic update) ────────────────────────────────
    const sendMessage = useCallback(async (text, extra = {}) => {
        if (!currentEmail || !selectedContact || !text.trim()) return false;
        const senderRole = currentRole === "superadmin" ? "super_admin" : currentRole;
        const now = new Date().toISOString();

        // 1. Immediately show optimistic bubble
        const optimisticId = `opt-${Date.now()}`;
        const optimistic = {
            id: optimisticId,
            _optimistic: true,
            sender_email: currentEmail,
            receiver_email: selectedContact.email,
            sender_role: senderRole,
            message: text.trim(),
            is_deleted: false,
            created_at: now,
            ...extra,
        };
        setMessages((prev) => [...prev, optimistic]);

        // 2. Persist to Supabase
        const { data, error } = await supabase
            .from("messages")
            .insert({
                sender_email: currentEmail,
                receiver_email: selectedContact.email,
                sender_role: senderRole,
                message: text.trim(),
                is_deleted: false,
                ...extra,
            })
            .select()
            .single();

        if (error) {
            console.error("[sendMessage]", error.message);
            // Remove the optimistic message
            setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
            return false;
        }

        // 3. Swap optimistic with the real record (real-time may also arrive; dedup handles it)
        setMessages((prev) => prev.map((m) => m.id === optimisticId ? { ...data, _optimistic: false } : m));
        return true;
    }, [currentEmail, selectedContact, currentRole]);

    // ─── Edit Message ─────────────────────────────────────────────────────────
    const editMessage = useCallback(async (messageId, newText) => {
        if (!messageId || !newText.trim()) return false;
        // Optimistic update
        setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, message: newText.trim() } : m));
        const { error } = await supabase.from("messages").update({ message: newText.trim() }).eq("id", messageId);
        if (error) { console.error("[editMessage]", error.message); return false; }
        return true;
    }, []);

    // ─── Delete Message (soft) ────────────────────────────────────────────────
    const deleteMessage = useCallback(async (messageId) => {
        if (!messageId) return false;
        // Optimistic update
        setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, is_deleted: true } : m));
        const { error } = await supabase.from("messages").update({ is_deleted: true }).eq("id", messageId);
        if (error) { console.error("[deleteMessage]", error.message); return false; }
        return true;
    }, []);

    return {
        contacts, selectedContact, setSelectedContact,
        messages, loadingContacts, loadingMessages, userInfo,
        sendMessage, editMessage, deleteMessage,
    };
};
