import axios from "axios";
import { HttpException } from "./HttpException";


export const httpClient = axios.create(
    {
        baseURL: import.meta.env.VITE_API_URL + "/api" || '',
        withCredentials: true, // Sends cookies at each request
        headers: {
            // Find a way to send the real user TZ
            "X-Timezone": "Europe/Paris",
        }
    }
)

httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === "ECONNABORTED") {
            return Promise.reject(new HttpException(408))
        }

        if (error.response) {
            return Promise.reject(new HttpException(error.response.status, error.response.data))
        }

        return Promise.reject(new HttpException(500))
    }
)
