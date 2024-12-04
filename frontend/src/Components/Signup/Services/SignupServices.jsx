import AxiosService from '../../../Services/AxiosServices.jsx'
import { SignupUrls } from '../../../Services/Urls.jsx';

const axiosService = new AxiosService();

export const signup = async (signupCredentials) => {

    const user = await axiosService.post(SignupUrls.signup(), signupCredentials);

    if (user.data || user.response.data) {
        return user.data || user.response.data;
    }
}