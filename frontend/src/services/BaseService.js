// src/services/BaseService.js
import httpClient from "../configurations/httpClient";

export default class BaseService {
  static get(url, params) {
    return httpClient.get(url, { params }).then((res) => res.data);
  }

  static post(url, body) {
    return httpClient.post(url, body).then((res) => res.data);
  }

  static put(url, body) {
    return httpClient.put(url, body).then((res) => res.data);
  }

  static delete(url) {
    return httpClient.delete(url).then((res) => res.data);
  }
}
