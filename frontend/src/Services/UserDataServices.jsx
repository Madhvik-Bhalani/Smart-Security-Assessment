import AxiosService from './AxiosServices.jsx'
import { UserUrls } from './Urls.jsx';

const axiosService = new AxiosService();

// Read
export const getUserData = async (headers) => {

    const user = await axiosService.get(UserUrls.getUserData(), headers);
   
    if (user.data || user.response.data) {
        return user.data || user.response.data;
    }
}