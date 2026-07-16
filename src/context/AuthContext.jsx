import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure default axios properties
axios.defaults.headers.post['Content-Type'] = 'application/json';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attempt to restore user session from localStorage tokens on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          // Set authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.accessToken}`;
        } catch (err) {
          console.error('Failed to parse stored user info', err);
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Axios Interceptors for handling token refresh
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const storedUser = localStorage.getItem('userInfo');
            if (storedUser) {
              const parsed = JSON.parse(storedUser);
              
              // Call refresh endpoint
              const { data } = await axios.post('/api/auth/refresh', {
                refreshToken: parsed.refreshToken,
              });

              // Update token in storage and context
              const updatedUser = {
                ...parsed,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
              };

              localStorage.setItem('userInfo', JSON.stringify(updatedUser));
              setUser(updatedUser);

              // Update Axios common auth header
              axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

              // Retry the original request
              return axios(originalRequest);
            }
          } catch (refreshErr) {
            console.error('Refresh token expired or invalid', refreshErr);
            // Logout if refresh fails
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      return data;
    } catch (err) {
      throw err.response?.data?.message || 'Login failed. Please check credentials.';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password, role });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      return data;
    } catch (err) {
      throw err.response?.data?.message || 'Registration failed.';
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout server error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('userInfo');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('/api/auth/profile', profileData);
      
      const storedUser = localStorage.getItem('userInfo');
      let updatedUser = { ...data };
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        updatedUser = {
          ...parsed,
          name: data.name,
          email: data.email,
          profilePicture: data.profilePicture,
        };
      }

      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to update profile';
    }
  };

  const toggleWishlist = async (eventId) => {
    try {
      const { data } = await axios.post(`/api/events/${eventId}/wishlist`);
      
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const updatedUser = { ...parsed, wishlist: data.wishlist };
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
      return data.wishlist;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to update wishlist';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        toggleWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
