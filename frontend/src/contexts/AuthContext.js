import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const operations = {
        query: `
          mutation SignIn($input: SignInInput!) {
            signIn(input: $input) {
              code
              role
              userId
              success
              message
              auth {
                userId
                token
                role
                accessToken 
              }
            }
          }
        `,
        variables: {
          input: { email, password }
        }
      };

      const response = await axios.post('/graphql', operations);

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const signInResult = response.data.data.signIn;

      if (!signInResult.success || !signInResult.auth) {
        let feedback = '登录失败，请检查邮箱和密码是否正确';
        if (signInResult.code === 'USER_NOT_FOUND') {
          feedback = '用户不存在';
        } else if (signInResult.code === 'INVALID_PASSWORD') {
          feedback = '密码错误';
        }
        throw new Error(feedback);
      }

      setUser(signInResult.auth);
      localStorage.setItem('auth', JSON.stringify(signInResult.auth));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};