import { RESTDataSource } from "@apollo/datasource-rest";

class PaymentService extends RESTDataSource {
  constructor({ bookingRepository, paymentRepository }) {
    super();
    this.bookingRepository = bookingRepository;
    this.paymentRepository = paymentRepository;
   
    this.baseURL = 'http://localhost:4014/';
  }
}
export default PaymentService;