import axios from "axios";

const api = axios.create({
  baseURL: "http://172.30.1.55:8888/api", //스프링부트 백엔드 기본 url
  withCredentials: true, //세션 쿠키 전달
});

export default api;
