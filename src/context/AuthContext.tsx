import Router from "next/router";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import {apiClientSide} from "../services/apiClientSide";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User | undefined;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;
	
  async function signOut() {
		destroyCookie(undefined, "nextauth.token");
		destroyCookie(undefined, "nextauth.refreshToken");
		
		authChannel.postMessage('signOut');
		
		await Router.push("/");
	}
	
	async function signIn({ email, password }: SignInCredentials) {
		try {
			// Rota de Login
			const response = await apiClientSide.post("sessions", {
				email,
				password,
			});
			
			const { token, refreshToken, permissions, roles } = response.data;
			
			setCookie(undefined, "nextauth.token", token, {
				maxAge: 60 * 60, // 1 hour
				path: "/",
			});
			
			setCookie(undefined, "nextauth.refreshToken", refreshToken, {
				maxAge: 60 * 60, // 1 hour
				path: "/",
			});
			
			setUser({
				email,
				permissions,
				roles,
			});
			
			apiClientSide.defaults.headers["Authorization"] = `Bearer ${token}`;
			
			await Router.push("/dashboard");
		} catch (err) {
			console.log(err);
		}
	}
	
  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();

    if (token) {
      apiClientSide
        .get("me")
        .then((response) => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch((error) => {
          signOut().then(() => console.log(error));
        });
    }
  }, []);
  
  useEffect(() => {
  	authChannel = new BroadcastChannel('auth');
  	
  	authChannel.onmessage = (message: MessageEvent) => {
			switch (message.data) {
				case 'signOut':
					signOut();
					break;
				default:
					break;
			}
		}
	}, [])

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
