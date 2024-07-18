import { RESTDataSource } from '@apollo/datasource-rest';

class BaseAPI extends RESTDataSource {
  constructor(baseURL) {
    super();
    this.baseURL = baseURL;
  }
}

export default BaseAPI;
