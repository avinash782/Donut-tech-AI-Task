import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

// Generic hook to fetch Supabase table data
export const useSupabase = (tableName, queryCondition = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        let builder = supabase.from(tableName).select("*");

        // Support a simple equality filter: { field, operator, value }
        if (queryCondition && queryCondition.field && queryCondition.value != null) {
          // only '=' supported here for simplicity
          builder = builder.eq(queryCondition.field, queryCondition.value);
        }

        const { data: rows, error: sbError } = await builder;

        if (sbError) throw sbError;

        if (!cancelled) {
          setData(Array.isArray(rows) ? rows : []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || String(err));
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [tableName, JSON.stringify(queryCondition)]);

  return { data, loading, error };
};
