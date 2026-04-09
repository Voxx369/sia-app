import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

export function useSiteContent(keys = []) {
  const keySignature = useMemo(() => JSON.stringify(keys || []), [keys]);

  const normalizedKeys = useMemo(() => {
    let parsed = [];
    try {
      parsed = JSON.parse(keySignature);
    } catch {
      parsed = [];
    }

    const list = Array.isArray(parsed) ? parsed : [];
    return Array.from(new Set(list.filter(Boolean)));
  }, [keySignature]);

  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(normalizedKeys.length > 0);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (normalizedKeys.length === 0) {
        setContent({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await api.getContent(normalizedKeys);
        if (!ignore) {
          setContent(data || {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Impossible de charger le contenu");
          setContent({});
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [keySignature, normalizedKeys]);

  return { content, loading, error };
}
