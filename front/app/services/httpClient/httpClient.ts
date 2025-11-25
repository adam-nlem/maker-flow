import axios from "axios";
import { BadRequestException, ConflictException, ForbiddenException, InternalServerException, NotFoundException, TimeoutException, UnauthorizedException } from "./customHttpExceptions";


export const httpClient = axios.create(
    {
        baseURL: import.meta.env.VITE_API_URL + "/api" || '',
        withCredentials: true, // Sends cookies at each request
        headers: {
            // Find a way to send the real pneuser TZ
            "X-Timezone": "Europe/Paris",
        }
    }
)

httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        let e;

        if (error.code === "ECONNABORTED") {
            e = new TimeoutException("Le serveur a mis trop longtemps à répondre");
        } else if (error.response) {
            const err = error.response;
            switch (err.status) {
                case 400:
                    e = new BadRequestException(err.message, err.data);
                    break;
                case 401:
                    e = new UnauthorizedException(err.message, err.data);

                    break;
                case 403:
                    e = new ForbiddenException(err.message, err.data);

                    break;
                case 404:
                    e = new NotFoundException(err.message, err.data);
                    break;
                case 409:
                    e = new ConflictException(err.message, err.data);
                    break;
                case 500:
                    e = new InternalServerException(err.message, err.data);

                    break;

                default:
                    e = new Error("Une erreur est survenue");
                    break;
            }
        } else {
            e = new Error("Une erreur est survenue");
        }

        return Promise.reject(e);
    }
)