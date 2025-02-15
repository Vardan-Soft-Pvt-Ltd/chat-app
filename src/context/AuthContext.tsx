import { BASE_URL } from "@/lib/utils";
import { createContext, useContext, useState } from "react";


interface AuthContextType {
    jwtToken: string | null;
    login: (credential: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function validate_token(id_token: string) {
    return fetch(BASE_URL + '/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: id_token }),
    });
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [jwtToken, setJwtToken] = useState(localStorage.getItem("jwt_token"));

    const login = async (credential: string) => {
        try {
            const response = await validate_token(credential);
            if (response.ok) {
                console.log('Login successful!');
                localStorage.setItem("jwt_token", 'token');
                setJwtToken(credential);
            } else {
                console.error('Login failed:');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const logout = async () => {
        try {
            const response = await fetch(BASE_URL + '/logout');
            if (response.ok) {
                console.log('Logout successful!');
                localStorage.removeItem("jwt_token");
                setJwtToken(null);
            } else {
                console.error('logout failed:');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ jwtToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}

