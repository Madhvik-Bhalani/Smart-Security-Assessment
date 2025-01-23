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


// Update
export const editProfile = async (editProfileData, headers) => {

    const user = await axiosService.put(UserUrls.editProfile(), editProfileData, headers);

    if (user.data || user.response.data) {
        return user.data || user.response.data;
    }
}

// Delete
export const deleteAccount = async (deleteAccountData, headers) => {

    const user = await axiosService.put(UserUrls.deleteAccount(), deleteAccountData, headers);

    if (user.data || user.response.data) {
        return user.data || user.response.data;
    }
}


// Add Fav Facility
export const addFavFacility = async (facilityData, headers) => {

    const resData = await axiosService.put(UserUrls.addFavFacility(), facilityData, headers);

    if (resData.data || resData.response.data) {
        return resData.data || resData.response.data;
    }
}


// remove Fav Facility
export const removeFavFacility = async (headers) => {

    const resData = await axiosService.put(UserUrls.removeFavFacility(), {}, headers);

    if (resData.data || resData.response.data) {
        return resData.data || resData.response.data;
    }
}


// Add Home Address
export const addHomeAddress = async (addressData, headers) => {

    const resData = await axiosService.put(UserUrls.addHomeAddress(), addressData, headers);

    if (resData.data || resData.response.data) {
        return resData.data || resData.response.data;
    }
}