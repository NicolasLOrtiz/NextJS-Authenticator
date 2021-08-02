import axios, {AxiosError, AxiosResponse} from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../context/AuthContext";
import {AuthTokenError} from "../errors/AuthTokenError";

let isRefreshing = false;
let failedRequestQueue = [] as any;

export function apiServeSide(ctx?: any){
	let cookies = parseCookies(ctx);
	
	const api = axios.create({
		baseURL: "http://localhost:3333",
		headers: {
			Authorization: `Bearer ${cookies["nextauth.token"]}`,
		},
	});

// Refresh Token
	api.interceptors.response.use(
		(response: AxiosResponse) => {
			return response;
		},
		(error: AxiosError) => {
			if (error.response?.status === 401) {
				if (error.response.data?.code === "token.expired") {
					// Renovar token
					cookies = parseCookies(ctx);
					
					const { "nextauth.refreshToken": refreshToken } = cookies;
					const originalConfig = error.config;
					
					if (!isRefreshing) {
						isRefreshing = true;
						
						api
							.post("/refresh", {
								refreshToken,
							})
							.then((response: AxiosResponse) => {
								const { token } = response.data;
								
								setCookie(ctx, "nextauth.token", token, {
									maxAge: 60 * 60 * 24 * 30, // 30 days
									path: "/",
								});
								
								setCookie(
									ctx,
									"nextauth.refreshToken",
									response.data.refreshToken,
									{
										maxAge: 60 * 60 * 24 * 30, // 30 days
										path: "/",
									}
								);
								
								api.defaults.headers["Authorization"] = `Bearer ${token}`;
								
								failedRequestQueue.forEach((request: any) =>
									request.onSuccess(token)
								);
								failedRequestQueue = [];
							})
							.catch((err) => {
								failedRequestQueue.forEach((request: any) =>
									request.onFailure(err)
								);
								failedRequestQueue = [];
								
								if(process.browser){
									signOut();
								}
							})
							.finally(() => {
								isRefreshing = false;
							});
					}
					
					return new Promise((resolve, reject) => {
						failedRequestQueue.push({
							onSuccess: (token: string) => {
								originalConfig.headers["Authorization"] = `Bearer ${token}`;
								
								resolve(api(originalConfig));
							},
							onFailure: (err: AxiosError) => {
								reject(err);
							},
						});
					});
				} else {
					// Deslogar usuário
					if(process.browser){
						signOut();
					} else {
						return Promise.reject(new AuthTokenError());
					}
				}
			}
			
			return Promise.reject(error);
		}
	);
	
	return api;
}
