// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAPI } from "./../services/userService";
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if token exists in localStorage when the app initializes
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode token to check for expiry
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setLoggedIn(true); // Token is valid
                    setUser(decoded); // Set user data from decoded token
                } else {
                    // Token has expired
                    localStorage.removeItem('token'); // Clear expired token
                    setLoggedIn(false); // Reflect logged-out state
                    setUser(null); // Clear user data
                }
            } catch (error) {
                console.error("Error decoding token: ", error);
                localStorage.removeItem('token'); // Clear invalid token
                setLoggedIn(false); // Reflect logged-out state
                setUser(null); // Clear user data
            }
        }
    }, []);

    // Placeholder function to change login state
    const login = async (username, password) => {
        const response = await loginAPI(username, password);
        if (response.data.success) {
            setLoggedIn(true);
            setUser(response.data.user); // Store the user data in state
            localStorage.setItem('token', response.data.token); // Store the token in local storage
            return true
        } else {
            // Handle login failure (e.g., set an error state, log to console)
            console.error('Login failed');
            return false
        }
    };
    const logout = () => {
        setLoggedIn(false);
        setUser(null); // Clear the user data
        localStorage.removeItem('token'); // Clear the token from local storage
      };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
