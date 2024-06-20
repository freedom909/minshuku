import { RESTDataSource } from '@apollo/datasource-rest';

class PaymentsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://rt-airlock-services-payments.herokuapp.com/';
  }

  getUserWallet(userId) {
    return this.get(`wallet/${userId}`);
  }

  addFunds({ userId, amount }) {
    return this.patch(`wallet/${userId}/add`, { body: { amount } });
  }

  subtractFunds({ userId, amount }) {
    return this.patch(`wallet/${userId}/subtract`, { body: { amount } });
  }
}

export default PaymentsAPI;