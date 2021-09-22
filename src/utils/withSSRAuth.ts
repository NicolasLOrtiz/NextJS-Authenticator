import { destroyCookie, parseCookies } from "nookies";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { AuthTokenError } from "../errors/AuthTokenError";
import decode from 'jwt-decode'
import {validateUserAuthorization} from "./validateUserAuthorization";

type WithSSRAuthOptions = {
	permissions?: string[];
	roles?: string[];
}

export function withSSRAuth<P>(
  serverSideFunction: GetServerSideProps<P>,
	options?: WithSSRAuthOptions
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
		const token = cookies["nextauth.token"];
    
    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    if(options){
			const user = decode<{ permissions: string[], roles: string[] }>(token);
			const { permissions, roles } = options;
	
			const userValidAuthorization = validateUserAuthorization({
				user,
				permissions,
				roles
			});
			
			if(!userValidAuthorization) {
				return {
					// notFound: true,
					redirect: {
						destination: '/dashboard',
						permanent: false,
					}
				}
			}
		}
    
    try {
      return await serverSideFunction(ctx);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, "nextauth.token");
        destroyCookie(ctx, "nextauth.refreshToken");

        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  };
}
