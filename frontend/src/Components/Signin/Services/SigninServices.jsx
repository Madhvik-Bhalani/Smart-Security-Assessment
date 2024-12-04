import AxiosService from '../../../Services/AxiosServices.jsx'
import { SigninUrls } from '../../../Services/Urls.jsx';

const axiosService = new AxiosService();

export const signin = async (signinCredentials) => {

    const user = await axiosService.post(SigninUrls.signin(), signinCredentials);

    if (user.data || user.response.data) {
        return user.data || user.response.data;
    }
}