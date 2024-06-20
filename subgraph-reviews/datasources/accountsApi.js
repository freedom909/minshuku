import { RESTDataSource } from '@apollo/datasource-rest';

class AccountsAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://localhost:4000/accounts';
    }
    async getUser(id){
        return await this.get(`/${id}`);
     }
}
export default AccountsAPI;