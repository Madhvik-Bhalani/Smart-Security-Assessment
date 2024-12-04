const baseUrl = process.env.REACT_APP_API_URL;

export const SignupUrls = {
    signup: () => {
        return baseUrl + '/users/signup';
    }
}

export const SigninUrls = {
    signin: () => {
        return baseUrl + `/users/signin`;
    }
}

