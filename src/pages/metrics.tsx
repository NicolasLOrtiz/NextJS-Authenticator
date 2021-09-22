import {AxiosResponse} from "axios";
import {GetServerSideProps, GetServerSidePropsContext} from "next";
import {withSSRAuth} from "../utils/withSSRAuth";
import {apiServeSide} from "../services/apiServerSide";

export default function Metrics() {
	return (
		<>
			<h1>Metricas</h1>
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
}, {
	permissions: ['metrics.list'],
	roles: ['administrator'],
})