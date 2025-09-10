
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const saved = localStorage.getItem("auth");
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (auth) {
            localStorage.setItem("auth", JSON.stringify(auth));
        } else {
            localStorage.removeItem("auth");
        }
    }, [auth]);

    const login = (data) => {
        setAuth(data);
    };

    const logout = async () => {
        try {
            if (auth?.token) {
                await axios.post(
                    "http://localhost:8080/api/auth/logout",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${auth.token}`,
                        },
                    }
                );
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setAuth(null);
        }
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
