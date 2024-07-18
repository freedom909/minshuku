import AccountsAPI from "./accounts.js";

const accountsAPI = new AccountsAPI();
const newUser=accountsAPI.registerGuest({
    email: "guest@example.com",
    name: "guest",
    password: "guest",
    nickname: "guest",
    role:"GUEST",
    picture: "http://example.com:8080"
})

console.log(newUser)