import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../config/SupabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [domain, setDomain] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDomainFromRoleTable = async (userEmail, userRole) => {
    if (!userRole || !userEmail) {
      console.log("[FETCH_DOMAIN] Missing userRole or userEmail");
      return null;
    }

    // Super admin has no domain - they see all tasks
    if (userRole === "superadmin" || userRole === "super_admin") {
      console.log("[FETCH_DOMAIN] Superadmin detected - no domain needed");
      return null;
    }

    try {
      console.log(`[FETCH_DOMAIN] Fetching domain for ${userEmail} from table: ${userRole}`);

      // Query the table with the same name as the role (e.g., 'admin', 'worker')
      const { data, error } = await supabase
        .from(userRole)
        .select('domain')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.warn(`[FETCH_DOMAIN] Supabase error:`, error.message);
        return null;
      }

      const domain = data?.domain || null;
      console.log(`[FETCH_DOMAIN] Domain fetched: ${domain}`);
      return domain;
    } catch (err) {
      console.warn(`[FETCH_DOMAIN] Exception:`, err.message);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser = session?.user ?? null;

        if (!mounted) return;

        if (currentUser) {
          setUser(currentUser);
          const userRole = currentUser.user_metadata?.role || null;
          setRole(userRole);
          setIsAuthenticated(true);

          // ✅ Restore domain on page reload
          if (userRole) {
            try {
              const fetchedDomain = await fetchDomainFromRoleTable(currentUser.email, userRole);
              if (mounted) setDomain(fetchedDomain);
            } catch (e) {
              console.warn("[INIT] Domain fetch failed:", e);
            }
          }
        } else {
          setUser(null);
          setRole(null);
          setDomain(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.warn("Failed to get Supabase session:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      if (u) {
        setUser(u);
        const userRole = u.user_metadata?.role || null;
        setRole(userRole);
        setIsAuthenticated(true);

        // ✅ Restore domain on auth state change
        if (userRole) {
          try {
            const fetchedDomain = await fetchDomainFromRoleTable(u.email, userRole);
            setDomain(fetchedDomain);
          } catch (e) {
            console.warn("[AUTH_CHANGE] Domain fetch failed:", e);
          }
        }
      } else {
        setUser(null);
        setRole(null);
        setDomain(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (emailOrUserData, passwordOrRole, roleOrDomain) => {
    setLoading(true);
    console.log("LOGIN STARTED", { emailOrUserData, passwordOrRole, roleOrDomain });

    // Check if it's local authentication (userData object passed from Login.jsx)
    // or Supabase authentication (email and password strings)
    if (typeof emailOrUserData === 'object' && emailOrUserData !== null) {
      // Local authentication from JSON files (Login.jsx)
      const userData = emailOrUserData;
      const role = passwordOrRole;
      const domain = roleOrDomain;

      // Create a user-like object with the data from JSON
      const user = {
        id: userData.id,
        email: userData.email,
        user_metadata: {
          role: role,
          domain: domain,
          name: userData.name
        }
      };

      setUser(user);
      setRole(role);
      setDomain(domain);
      setIsAuthenticated(true);
      setLoading(false);
      return { user, session: null };
    } else {
      // Supabase authentication (email, password, and selected role)
      const email = emailOrUserData;
      const password = passwordOrRole;
      const selectedRole = roleOrDomain;

      console.log(`[LOGIN] Starting Supabase auth for email=${email}, role=${selectedRole}`);

      try {
        console.log(`[LOGIN] Calling signInWithPassword...`);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        console.log(`[LOGIN] SignIn response received. Error:`, error, "Data:", data?.user?.id);

        if (error) {
          console.error(`[LOGIN] Auth error:`, error.message);
          setLoading(false);
          throw error;
        }

        const u = data.user ?? null;
        console.log(`[LOGIN] User authenticated:`, u?.id);

        if (u) {
          console.log(`[LOGIN] Updating user role to ${selectedRole}...`);

          // Update user metadata with selected role
          const { error: updateError } = await supabase.auth.updateUser({
            data: { role: selectedRole }
          });

          if (updateError) {
            console.warn(`[LOGIN] Warning updating user role:`, updateError);
          } else {
            console.log(`[LOGIN] Role updated successfully`);
          }

          console.log(`[LOGIN] Setting user state...`);
          setUser(u);
          setRole(selectedRole);
          setIsAuthenticated(true);

          // Fetch domain from role-based table
          if (selectedRole) {
            console.log(`[LOGIN] Fetching domain...`);
            try {
              const domain = await fetchDomainFromRoleTable(email, selectedRole);
              console.log(`[LOGIN] Domain fetch complete:`, domain);
              setDomain(domain);
            } catch (domainErr) {
              console.error(`[LOGIN] Error fetching domain:`, domainErr);
              setDomain(null);
            }
          }
        }

        console.log(`[LOGIN] Setting loading to false...`);
        setLoading(false);
        console.log(`[LOGIN] LOGIN COMPLETE`);
        return data;
      } catch (err) {
        console.error(`[LOGIN] Catch block error:`, err);
        setLoading(false);
        throw err;
      }
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setDomain(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, domain, isAuthenticated, login, logout, signup, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
