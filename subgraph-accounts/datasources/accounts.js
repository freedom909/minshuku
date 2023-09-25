import { RESTDataSource } from '@apollo/datasource-rest';
class AccountsAPI extends RESTDataSource {
    baseURL = 'http://localhost:4011/';

    login(username) {
        return this.get(`login/${username}`);

    }
    updateUser({ userId, userInfo }) {
        return this.patch(`user/${userId}`, { body: { ...userInfo } })
    }
    getUser(userId) {
        return this.get(`user/${userId}`)
    }
    getGalacticCoordinates(userId) {
        return this.get(`user/${userId}/coordinates`);
      }
}
export default AccountsAPI