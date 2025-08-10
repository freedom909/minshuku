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
          feedback = '此邮箱尚未注册，请先注册账号';
        } else if (signInResult.code === 'INVALID_PASSWORD') {
          feedback = '密码错误，请重试';
        }
        throw new Error(feedback);
      }

      const { token } = signInResult.auth;

      localStorage.setItem('token', token);
      setUser(signInResult.auth);

      navigate('/dashboard');

      return { success: true, user: signInResult.auth };
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const operations = {
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              token
              user {
                id
                name
                email
                bio
                location
                phone
                profilePicture
              }
            }
          }
        `,
        variables: {
          input: {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            bio: formData.get('bio'),
            location: formData.get('location'),
            phone: formData.get('phone'),
            profilePicture: formData.get('profilePicture') || null
          }
        }
      };

      const response = await axios.post('/graphql', operations, config);

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const { token, user } = response.data.data.register;

      if (!token) {
        throw new Error('Registration successful but no token received');
      }

      localStorage.setItem('token', token);
      setUser(user); // ✅ Corrected from `signInResult.auth` to `user`

      navigate('/dashboard');

      return user;
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
