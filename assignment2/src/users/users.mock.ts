import fs from "fs";

export function loginDetails(login: string) {
    return JSON.parse(fs.readFileSync(`./mock_data/userDetails.${login}.json`, "utf-8"));
}

export function loginDetailsUserNotFound() {
    return JSON.parse(fs.readFileSync(`./mock_data/userDetails.not_found.json`, "utf-8"));
}

export function usersList(since: number, per_page: number) {
    let users = JSON.parse(fs.readFileSync(`./mock_data/usersList.json`, "utf-8"));
    return users.slice(since, since + per_page);
}

export function emptyUsersList() {
    return [];
}
