import {useEffect} from "react";
import {useAuth} from "../hooks/useAuth";
import {AxiosError, AxiosResponse} from "axios";
import {GetServerSideProps, GetServerSidePropsContext} from "next";
import {withSSRAuth} from "../utils/withSSRAuth";
import {apiClientSide} from "../services/apiClientSide";
import {apiServeSide} from "../services/apiServerSide";
import {useCan} from "../hooks/useCan";
import {Can} from "../components/Can";

export default function Dashboard() {
	const {user, signOut} = useAuth();
	
	const userCanSeeMetrics = useCan({
		// permissions: ['metrics.list']
		roles: ['administrator', 'editor']
	});
	
	useEffect(() => {
		apiClientSide
			.get("me")
			.then((response: AxiosResponse) => console.log(response.data))
			.catch((err: AxiosError) => console.log(err));
	}, []);
	
	return (
		<>
			<h1>Hello: {user?.email}</h1>
			
			{ userCanSeeMetrics && <div>Métricas</div> }
			
			<button onClick={signOut}>Sign Out</button>
			
			<Can permissions={['metrics.list']}>
				<div>Métricas - Pelo Componente</div>
			</Can>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = withSSRAuth<{}>(async (ctx: GetServerSidePropsContext) => {
	const apiServerSide = apiServeSide(ctx);
	
	const response: AxiosResponse = await apiServerSide.get('/me');
	
	console.log(response.data)
	
	return {
		props: {}
	}
})