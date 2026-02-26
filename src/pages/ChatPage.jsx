import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useChatSupabase } from "../hooks/useChatSupabase";
import { supabase } from "../config/SupabaseClient";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

const roleColors = {
    super_admin: { bg: "#ef4444", label: "Super Admin" },
    superadmin: { bg: "#ef4444", label: "Super Admin" },
    admin: { bg: "#8b5cf6", label: "Admin" },
    worker: { bg: "#0ea5e9", label: "Worker" },
};

const avatarBg = (r) => roleColors[r]?.bg || "#6b7280";
const roleLabel = (r) => roleColors[r]?.label || r;

const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, role, size = 38 }) => (
    <div
        style={{
            width: size, height: size, borderRadius: "50%",
            background: `linear-gradient(135deg, ${avatarBg(role)}, ${avatarBg(role)}cc)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
        }}
    >
        {getInitials(name)}
    </div>
);

// ─── Dropdown Menu for message actions ───────────────────────────────────────
/**
 * A small ▾ arrow appears when hovering the bubble.
 * Click it → vertical dropdown with: Reply, Copy, Forward, Edit (own only), Delete (own only).
 */
const MessageDropdown = ({ isMine, onReply, onCopy, onForward, onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const items = [
        { label: "Reply", icon: "↩️", action: onReply },
        { label: "Copy", icon: "📋", action: onCopy },
        { label: "Forward", icon: "↪️", action: onForward },
        ...(isMine ? [
            { label: "Edit", icon: "✏️", action: onEdit },
            { label: "Delete", icon: "🗑️", action: onDelete, danger: true },
        ] : []),
    ];

    return (
        <div ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            {/* ▾ trigger button */}
            <button
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                title="Message options"
                style={{
                    background: open ? "#e2e8f0" : "rgba(255,255,255,0.85)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "50%",
                    width: 22, height: 22,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: 11, color: "#64748b",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    transition: "all 0.15s",
                    lineHeight: 1,
                    padding: 0,
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "rgba(255,255,255,0.85)"; }}
            >
                ▾
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: 26,
                        [isMine ? "right" : "left"]: 0,
                        background: "#fff",
                        borderRadius: 10,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        border: "1px solid #e2e8f0",
                        minWidth: 140,
                        zIndex: 999,
                        overflow: "hidden",
                        animation: "dropFade 0.15s ease",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {items.map(({ label, icon, action, danger }) => (
                        <button
                            key={label}
                            onClick={() => { action(); setOpen(false); }}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", gap: 9,
                                padding: "9px 14px", border: "none", background: "transparent",
                                cursor: "pointer", textAlign: "left", fontSize: 13,
                                color: danger ? "#dc2626" : "#374151",
                                fontWeight: 500, transition: "background 0.12s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "#fee2e2" : "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <span style={{ fontSize: 15 }}>{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Reply Preview Bar ────────────────────────────────────────────────────────
const ReplyBar = ({ replyTo, senderName, onCancel }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#f0fdfa", borderTop: "2px solid #008080" }}>
        <div style={{ flex: 1, borderLeft: "3px solid #008080", paddingLeft: 10 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#008080" }}>Replying to {senderName}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 420 }}>
                {replyTo.message}
            </p>
        </div>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", padding: 4, lineHeight: 1 }}>✕</button>
    </div>
);

// ─── Forward Modal ────────────────────────────────────────────────────────────
const ForwardModal = ({ msg, contacts, onClose, onForward }) => {
    const [search, setSearch] = useState("");
    const filtered = contacts.filter(
        (c) =>
            (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.email || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 16, width: 360, maxHeight: 520, boxShadow: "0 8px 40px rgba(0,0,0,0.22)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: "18px 20px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Forward Message</h3>
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#475569", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        "{msg.message}"
                    </div>
                </div>
                <div style={{ padding: "10px 16px" }}>
                    <input
                        autoFocus
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", fontSize: 13, color: "#1e293b", boxSizing: "border-box" }}
                        onFocus={(e) => (e.target.style.borderColor = "#008080")}
                        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 12px" }}>
                    {filtered.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 20 }}>No contacts found</p>
                    ) : (
                        filtered.map((c) => (
                            <button
                                key={c.email}
                                onClick={() => onForward(c)}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: "none", background: "transparent", borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                <Avatar name={c.name || c.email} role={c.role} size={36} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{c.name || c.email}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{roleLabel(c.role)}{c.domain ? ` · ${c.domain}` : ""}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
                <div style={{ padding: "10px 16px", borderTop: "1px solid #f1f5f9" }}>
                    <button onClick={onClose} style={{ width: "100%", padding: 9, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isMine, senderName, onEdit, onDelete, onCopy, onReply, onForward }) => {
    const [hovered, setHovered] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(msg.message);
    const inputRef = useRef(null);

    useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

    const handleSaveEdit = async () => {
        if (editText.trim() && editText.trim() !== msg.message) await onEdit(msg.id, editText);
        setEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
        if (e.key === "Escape") { setEditing(false); setEditText(msg.message); }
    };

    if (msg.is_deleted) {
        return (
            <div style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom: 6, padding: "0 16px" }}>
                <div style={{ background: "#f1f5f9", border: "1px dashed #cbd5e1", borderRadius: 12, padding: "8px 14px", color: "#94a3b8", fontStyle: "italic", fontSize: 13 }}>
                    🗑️ This message was deleted
                </div>
            </div>
        );
    }

    return (
        <div
            style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", marginBottom: 10, padding: "0 16px" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {!isMine && <span style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2, marginLeft: 6 }}>{senderName}</span>}

            {/* Reply quote */}
            {msg.reply_to_message && (
                <div style={{ maxWidth: "60%", marginBottom: 4, borderLeft: "3px solid #008080", background: "#f0fdfa", borderRadius: "0 8px 8px 0", padding: "5px 10px 5px 8px", alignSelf: isMine ? "flex-end" : "flex-start" }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#008080" }}>{msg.reply_to_sender || "Someone"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }}>{msg.reply_to_message}</p>
                </div>
            )}

            {/* Forwarded badge */}
            {msg.is_forwarded && <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2, fontStyle: "italic" }}>↪ Forwarded</div>}

            {/* Row: dropdown arrow + bubble */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexDirection: isMine ? "row-reverse" : "row" }}>

                {/* ▾ dropdown — shown on hover */}
                <div style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.15s", alignSelf: "center" }}>
                    <MessageDropdown
                        isMine={isMine}
                        onReply={onReply}
                        onCopy={onCopy}
                        onForward={onForward}
                        onEdit={() => { setEditing(true); setEditText(msg.message); }}
                        onDelete={() => onDelete(msg.id)}
                    />
                </div>

                {/* Bubble */}
                <div
                    style={{
                        maxWidth: "65%", minWidth: 60,
                        padding: editing ? "8px 10px" : "10px 14px",
                        borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: isMine ? "linear-gradient(135deg, #008080, #006666)" : "#f1f5f9",
                        color: isMine ? "#fff" : "#1e293b",
                        fontSize: 14, lineHeight: 1.5,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        wordBreak: "break-word",
                    }}
                >
                    {editing ? (
                        <div>
                            <textarea
                                ref={inputRef}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={2}
                                style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, color: "inherit", fontSize: 14, padding: "4px 8px", resize: "none", outline: "none", fontFamily: "inherit" }}
                            />
                            <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
                                <button onClick={() => { setEditing(false); setEditText(msg.message); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, color: "inherit", padding: "3px 10px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                                <button onClick={handleSaveEdit} style={{ background: "rgba(255,255,255,0.25)", border: "none", borderRadius: 6, color: "inherit", padding: "3px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save</button>
                            </div>
                        </div>
                    ) : msg.message}
                </div>
            </div>

            <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, alignSelf: isMine ? "flex-end" : "flex-start", paddingRight: isMine ? 4 : 0, paddingLeft: isMine ? 0 : 4 }}>
                {formatTime(msg.created_at)}
                {msg._optimistic && <span style={{ marginLeft: 4, opacity: 0.6 }}>⏳</span>}
            </span>
        </div>
    );
};

// ─── Date Divider ─────────────────────────────────────────────────────────────
const DateDivider = ({ label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px" }}>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
    </div>
);

// ─── Contact Item ─────────────────────────────────────────────────────────────
const ContactItem = ({ contact, isActive, lastMsg, onClick }) => (
    <button
        onClick={onClick}
        style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px",
            background: isActive ? "linear-gradient(135deg, rgba(0,128,128,0.12), rgba(0,100,100,0.08))" : "transparent",
            border: "none", borderRadius: 10, cursor: "pointer", textAlign: "left",
            transition: "background 0.15s",
            outline: isActive ? "1px solid rgba(0,128,128,0.3)" : "none",
        }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
        <Avatar name={contact.name || contact.email} role={contact.role} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: isActive ? 700 : 600, fontSize: 13.5, color: isActive ? "#008080" : "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>
                    {contact.name || contact.email}
                </span>
                {lastMsg && <span style={{ fontSize: 10.5, color: "#94a3b8", flexShrink: 0, marginLeft: 4 }}>{formatTime(lastMsg.created_at)}</span>}
            </div>
            <div style={{ marginTop: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 600, background: `${avatarBg(contact.role)}22`, color: avatarBg(contact.role), padding: "1px 6px", borderRadius: 20 }}>
                    {roleLabel(contact.role)}{contact.domain ? ` · ${contact.domain}` : ""}
                </span>
            </div>
            {lastMsg && !lastMsg.is_deleted && (
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lastMsg.message}
                </p>
            )}
        </div>
    </button>
);

// ─── Main ChatPage ────────────────────────────────────────────────────────────
const ChatPage = () => {
    const { user, role, domain } = useAuth();
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [forwardMsg, setForwardMsg] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const {
        contacts, selectedContact, setSelectedContact,
        messages, loadingContacts, loadingMessages, userInfo,
        sendMessage, editMessage, deleteMessage,
    } = useChatSupabase(user, role, domain);

    const currentEmail = user?.email;
    const displayName = userInfo?.name || currentEmail || "You";

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, selectedContact]);
    useEffect(() => { inputRef.current?.focus(); }, [selectedContact]);

    const handleSend = async () => {
        if (!input.trim() || !selectedContact) return;
        const extra = {};
        if (replyTo) {
            extra.reply_to_message = replyTo.message;
            extra.reply_to_sender = replyTo.sender_email === currentEmail
                ? displayName
                : contacts.find((c) => c.email === replyTo.sender_email)?.name || replyTo.sender_email;
        }
        const ok = await sendMessage(input.trim(), extra);
        if (ok) { setInput(""); setReplyTo(null); }
    };

    const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

    const handleCopy = useCallback((text) => { navigator.clipboard.writeText(text); showToast("Message copied!"); }, []);

    const handleForward = useCallback(async (targetContact) => {
        if (!forwardMsg) return;
        const senderRole = role === "superadmin" ? "super_admin" : role;
        const { error } = await supabase.from("messages").insert({
            sender_email: currentEmail, receiver_email: targetContact.email,
            sender_role: senderRole, message: forwardMsg.message,
            is_deleted: false, is_forwarded: true,
        });
        if (!error) showToast(`Forwarded to ${targetContact.name || targetContact.email}`);
        setForwardMsg(null);
    }, [forwardMsg, currentEmail, role]);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

    // Filter & group contacts
    const filteredContacts = contacts.filter((c) => {
        const q = search.toLowerCase();
        return (c.name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q) || (c.domain || "").toLowerCase().includes(q);
    });

    const groupedContacts = filteredContacts.reduce((acc, c) => {
        const g = roleLabel(c.role);
        if (!acc[g]) acc[g] = [];
        acc[g].push(c);
        return acc;
    }, {});

    const groupedMessages = messages.reduce((acc, msg) => {
        const label = formatDate(msg.created_at);
        if (!acc[label]) acc[label] = [];
        acc[label].push(msg);
        return acc;
    }, {});

    return (
        <div style={{ display: "flex", height: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif", overflow: "hidden" }}>

            {/* ── Left: Contacts Panel ─────────────────────────── */}
            <div style={{ width: 300, minWidth: 240, background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Header */}
                <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Messages</h2>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
                        {contacts.length} contact{contacts.length !== 1 ? "s" : ""} available
                    </p>
                </div>

                {/* Search */}
                <div style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f5f9", borderRadius: 10, padding: "8px 12px" }}>
                        <span style={{ color: "#94a3b8", fontSize: 14 }}>🔍</span>
                        <input
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1e293b" }}
                        />
                    </div>
                </div>

                {/* Contact List */}
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 16px" }}>
                    {loadingContacts ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 12, color: "#94a3b8" }}>
                            <div className="chat-spinner" />
                            <span style={{ fontSize: 13 }}>Loading contacts...</span>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 16px", color: "#94a3b8", fontSize: 13 }}>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>🤝</div>
                            <p style={{ margin: 0 }}>No contacts found</p>
                            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Your contacts appear here based on your role</p>
                        </div>
                    ) : (
                        Object.entries(groupedContacts).map(([group, members]) => (
                            <div key={group} style={{ marginBottom: 8 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 6px 4px", margin: 0 }}>
                                    {group}s
                                </p>
                                {members.map((c) => (
                                    <ContactItem
                                        key={c.email}
                                        contact={c}
                                        isActive={selectedContact?.email === c.email}
                                        lastMsg={selectedContact?.email === c.email ? messages[messages.length - 1] || null : null}
                                        onClick={() => { setSelectedContact(c); setInput(""); setReplyTo(null); }}
                                    />
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {/* Current user footer */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10, background: "#fafafa" }}>
                    <Avatar name={displayName} role={role} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{roleLabel(role)}{domain ? ` · ${domain}` : ""}</p>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                </div>
            </div>

            {/* ── Right: Chat Area ─────────────────────────────── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: "16px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <Avatar name={selectedContact.name || selectedContact.email} role={selectedContact.role} size={44} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{selectedContact.name || selectedContact.email}</h3>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, background: `${avatarBg(selectedContact.role)}18`, color: avatarBg(selectedContact.role), padding: "2px 8px", borderRadius: 20 }}>
                                        {roleLabel(selectedContact.role)}
                                    </span>
                                    {selectedContact.domain && <span style={{ fontSize: 11, color: "#94a3b8" }}>· {selectedContact.domain}</span>}
                                </div>
                            </div>
                            <div style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>{selectedContact.email}</div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "16px 0", display: "flex", flexDirection: "column" }}>
                            {loadingMessages ? (
                                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#94a3b8" }}>
                                    <div className="chat-spinner" />
                                    <span style={{ fontSize: 13 }}>Loading messages...</span>
                                </div>
                            ) : messages.length === 0 ? (
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", gap: 12 }}>
                                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #008080, #004d4d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>💬</div>
                                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#475569" }}>Start a conversation</p>
                                    <p style={{ margin: 0, fontSize: 13 }}>Send a message to {selectedContact.name || selectedContact.email}</p>
                                </div>
                            ) : (
                                Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                                    <React.Fragment key={dateLabel}>
                                        <DateDivider label={dateLabel} />
                                        {msgs.map((msg) => {
                                            const isMine = msg.sender_email === currentEmail;
                                            const senderName = isMine
                                                ? displayName
                                                : contacts.find((c) => c.email === msg.sender_email)?.name || msg.sender_email;
                                            return (
                                                <MessageBubble
                                                    key={msg.id}
                                                    msg={msg}
                                                    isMine={isMine}
                                                    senderName={senderName}
                                                    onEdit={editMessage}
                                                    onDelete={deleteMessage}
                                                    onCopy={() => handleCopy(msg.message)}
                                                    onReply={() => { setReplyTo(msg); inputRef.current?.focus(); }}
                                                    onForward={() => setForwardMsg(msg)}
                                                />
                                            );
                                        })}
                                    </React.Fragment>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Preview Bar */}
                        {replyTo && (
                            <ReplyBar
                                replyTo={replyTo}
                                senderName={
                                    replyTo.sender_email === currentEmail
                                        ? "yourself"
                                        : contacts.find((c) => c.email === replyTo.sender_email)?.name || replyTo.sender_email
                                }
                                onCancel={() => setReplyTo(null)}
                            />
                        )}

                        {/* Input Bar */}
                        <div style={{ padding: "14px 20px", background: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "flex-end", gap: 10, boxShadow: "0 -1px 4px rgba(0,0,0,0.04)" }}>
                            <div
                                style={{ flex: 1, background: "#f1f5f9", borderRadius: 14, padding: "10px 16px", display: "flex", alignItems: "flex-end", border: "1.5px solid transparent", transition: "border-color 0.15s" }}
                                onFocusCapture={(e) => { e.currentTarget.style.borderColor = "#008080"; e.currentTarget.style.background = "#fff"; }}
                                onBlurCapture={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#f1f5f9"; }}
                            >
                                <textarea
                                    ref={inputRef}
                                    rows={1}
                                    placeholder={`Message ${selectedContact.name || selectedContact.email}...`}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                                    }}
                                    onKeyDown={handleKeyDown}
                                    style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14, color: "#1e293b", resize: "none", fontFamily: "inherit", width: "100%", lineHeight: 1.5, maxHeight: 120, overflow: "auto" }}
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                style={{
                                    width: 44, height: 44, borderRadius: "50%", border: "none",
                                    background: input.trim() ? "linear-gradient(135deg, #008080, #005f5f)" : "#e2e8f0",
                                    color: input.trim() ? "#fff" : "#94a3b8",
                                    cursor: input.trim() ? "pointer" : "not-allowed",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 18, flexShrink: 0, transition: "all 0.2s",
                                    boxShadow: input.trim() ? "0 2px 8px rgba(0,128,128,0.3)" : "none",
                                }}
                            >
                                ➤
                            </button>
                        </div>
                    </>
                ) : (
                    /* No chat selected */
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", gap: 16, padding: 40 }}>
                        <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, #008080, #004d4d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, boxShadow: "0 4px 20px rgba(0,128,128,0.25)" }}>💬</div>
                        <div style={{ textAlign: "center" }}>
                            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Select a conversation</h2>
                            <p style={{ margin: 0, fontSize: 14, maxWidth: 320 }}>Choose a contact from the left panel to start messaging.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Forward Modal */}
            {forwardMsg && <ForwardModal msg={forwardMsg} contacts={contacts} onClose={() => setForwardMsg(null)} onForward={handleForward} />}

            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 9999, animation: "fadeIn 0.2s ease" }}>
                    ✅ {toast}
                </div>
            )}

            <style>{`
        .chat-spinner { width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#008080;border-radius:50%;animation:spin 0.8s linear infinite; }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeIn  { from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes dropFade{ from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)} }
      `}</style>
        </div>
    );
};

export default ChatPage;
