import React from 'react';
import axios from 'axios';

export default class AxiosService extends React.Component {
    
    async post(url, credentialsObject, headers) {
        const response = await axios.post(url, credentialsObject, { headers: headers })
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });

        return response;
    }
    
    async put(url, credentialsObject, headers) {
        const response = await axios.put(url, credentialsObject, { headers: headers })
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });

        return response;
    }

    async get(url, headers) {
        const response = await axios.get(url, { headers: headers })
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });

        return response;
    }

    async delete(url, headers) {
        const response = await axios.delete(url, { headers: headers })
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });

        return response;
    }
    
}