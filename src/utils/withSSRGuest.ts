import {parseCookies} from "nookies";
import {GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult} from "next";

export function withSSRGuest<P>(serverSideFunction: GetServerSideProps<P>): GetServerSideProps{

    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx);

        if (cookies['nextauth.token']){
            return {
                redirect: {
                    destination: '/dashboard',
                    permanent: false,
                }
            }
        }

        return await serverSideFunction(ctx);
    }
}