import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';

class Api {
  instance: AxiosInstance;

  constructor(config: CreateAxiosDefaults) {
    this.instance = axios.create(config);
  }
}
export default Api;
