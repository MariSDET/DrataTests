import axios from "axios";
import { UserDetails, UsersList } from "./user.model";
import { usersList } from "./users.mock";

const githubBaseUrl = "https://api.github.com";
const githubTimeout = 5000;

axios.defaults.baseURL = githubBaseUrl;
axios.defaults.timeout = githubTimeout;
axios.defaults.validateStatus = function (status: number) {
    return status < 500;
};

export async function listUsers(since: number, per_page: number): Promise<UsersList> {
    let promise = axios.get("/users", { params: { since: since, per_page: per_page } });
    return promise.then((response) => {
        if (response.status == 200) {
            return {
                since: since,
                per_page: per_page,
                results: response.data,
            } as UsersList;
        } else {
            throw new Error(`Unexpected response from gitHub server with status code ${response.status}`);
        }
    });
}

export async function userDetails(login: string): Promise<UserDetails> {
    let promise = axios.get(`/users/${login}`);
    return promise.then((response) => {
        if (response.status == 200) {
            return response.data as UserDetails;
        } else if (response.status == 404) {
            throw new Error(`User ${login} not found`);
        } else {
            throw new Error(`Unexpected response from gitHub server with status code ${response.status}`);
        }
    });
}
