import React, { createContext, useContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        const userInfo = {
          user_id: decodedToken.user_id,
          user_type: decodedToken.user_type,
          is_faculty: decodedToken.user_type === 'faculty',
          faculty_id: decodedToken.faculty_id,
          student_id: decodedToken.student_id
        };
        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
  }, []);

  const login = (userData) => {
    const token = localStorage.getItem('accessToken');
    const decodedToken = jwt_decode(token);
    const userInfo = {
      ...userData,
      is_faculty: decodedToken.user_type === 'faculty',
      faculty_id: decodedToken.faculty_id,
      student_id: decodedToken.student_id
    };
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
