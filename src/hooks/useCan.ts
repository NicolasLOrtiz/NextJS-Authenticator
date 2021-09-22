import {useAuth} from "./useAuth";
import {validateUserAuthorization} from "../utils/validateUserAuthorization";

type UseCanParams = {
	permissions?: string[];
	roles?: string[];
};

export function useCan({permissions, roles}: UseCanParams) : boolean {
	const { user, isAuthenticated } = useAuth();
	
	if(!isAuthenticated) {
		return false;
	}
	
	const userValidAuthorization = validateUserAuthorization({
		user,
		permissions,
		roles
	});
	
	return true;
}