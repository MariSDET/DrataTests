import axios from "axios";
import * as usersService from "./users.service";
import * as usersMock from "./users.mock";
let useMock = false;


beforeAll(() => {
    useMock = process.argv.includes("--mockNetwork=true");
});

beforeEach(() => {
    jest.restoreAllMocks();
});

function conditionalMock(mockImplementation: () => void) {
    if (useMock) {
        mockImplementation();
    }
}
describe("userDetails Service Edge Cases", () => {
test("usersService.userDetails, should return userDetails for valid users", async () => {
    conditionalMock(() => {
        jest.spyOn(axios, "get").mockImplementation((url: string) => {
            console.log(`Mocking network call: ${url}`);
            let username = url.split("/")[2];
            let data = usersMock.loginDetails(username);
            return Promise.resolve({ status: 200, data: data });
        });
    });

    //tests start here
    let mojomboUser = await usersService.userDetails("mojombo");
    expect(mojomboUser.login).toBe("mojombo");
    expect(mojomboUser.id).toBe(1);
    expect(mojomboUser.location).toBe("San Francisco");

    let defunktUser = await usersService.userDetails("defunkt");
    expect(defunktUser.login).toBe("defunkt");
    expect(defunktUser.id).toBe(2);
    expect(defunktUser.location).toBeNull();
});

test("usersService.userDetails, should handle errors for invalid users", async () => {
    conditionalMock(() => {
        jest.spyOn(axios, "get").mockImplementation((url: string, config) => {
            console.log(`Mocking network call: ${url}`);
            let data = usersMock.loginDetailsUserNotFound();
            let result = { status: 404, data: data };
            return Promise.resolve(result);
        });
    });
    expect(usersService.userDetails("user_")).rejects.toThrow("User user_ not found");
});

test("usersService.userDetails, [mock is always on] should handle error when github responds with unexpected error status code", async () => {
    jest.spyOn(axios, "get").mockImplementation((url: string, config) => {
        console.log(`Mocking network call: ${url}`);
        let result = { status: 500, data: null };
        return Promise.resolve(result);
    });
    expect(usersService.userDetails("user_")).rejects.toThrow("Unexpected response from gitHub server with status code 500");
});

test("usersService.listUsers, should handle list of users for valid query params", async () => {
    conditionalMock(() => {
        jest.spyOn(axios, "get").mockImplementation((url: string, config) => {
            console.log(`Mocking network call: ${url}`);
            let data = usersMock.usersList(config?.params["since"], config?.params["per_page"]);
            let result = { status: 200, data: data };
            return Promise.resolve(result);
        });
    });

    //tests start here
    let usersList = await usersService.listUsers(0, 5);
    expect(usersList.results.length).toBe(5);

    expect(usersList.results[0].id).toBe(1);
    expect(usersList.results[0].login).toBe("mojombo");
    expect(usersList.results[0].type).toBe("User");

    expect(usersList.results[4].id).toBe(5);
    expect(usersList.results[4].login).toBe("ezmobius");
    expect(usersList.results[4].type).toBe("User");

    let usersList2 = await usersService.listUsers(7, 10);
    expect(usersList2.results.length).toBe(10);

    expect(usersList2.results[0].id).toBe(17);
    expect(usersList2.results[0].login).toBe("vanpelt");
    expect(usersList2.results[0].type).toBe("User");

    expect(usersList2.results[1].id).toBe(18);
    expect(usersList2.results[1].login).toBe("wayneeseguin");
    expect(usersList2.results[1].type).toBe("User");
});

test("usersService.listUsers, should return empty list for too large 'since' parameter", async () => {
    conditionalMock(() => {
        jest.spyOn(axios, "get").mockImplementation((url: string, config) => {
            console.log(`Mocking network call: ${url}`);
            let data = usersMock.emptyUsersList();
            let result = { status: 200, data: data };
            return Promise.resolve(result);
        });
    });

    let usersList = await usersService.listUsers(999999999999, 5);

    expect(usersList.results.length).toBe(0);
});

test("usersService.listUsers, [mock is always on] should handle error when github responds with unexpected error status code", async () => {
    jest.spyOn(axios, "get").mockImplementation((url: string, config) => {
        console.log(`Mocking network call: ${url}`);
        let result = { status: 500, data: null };
        return Promise.resolve(result);
    });
    expect(usersService.listUsers(0, 5)).rejects.toThrow("Unexpected response from gitHub server with status code 500");
});
});
