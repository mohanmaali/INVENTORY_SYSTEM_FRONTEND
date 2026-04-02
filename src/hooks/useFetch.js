import { useState, useEffect } from 'react';
import axios from 'axios';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios(url, {
          ...options,
          signal: controller.signal,
        });
        
        setData(response.data);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [url, options.method]);

  return { data, loading, error };
}

export default useFetch;
