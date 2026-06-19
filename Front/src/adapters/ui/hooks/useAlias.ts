import { useState, useEffect } from 'react';
import { type AliasDetail } from '../../../domain/alias';
import { aliasAdapter } from '../../api/aliasApi';
export const useAlias = () => {
  const [aliases, setAliases] = useState<AliasDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchAliases = async () => {
    try {
      setLoading(true);
      // Aquí estamos usando el adaptador que creamos, ¡la UI no sabe que es un fetch!
      const data = await aliasAdapter.getAllAliasDeteails();
      setAliases(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAliases();
  }, []);
  return { aliases, loading, error, refetch: fetchAliases };
};