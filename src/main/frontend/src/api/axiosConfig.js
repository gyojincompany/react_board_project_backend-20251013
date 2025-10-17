import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8888", //스프링부트 백엔드 기본 url
  withCredentials: true, //세션 쿠키 전달
});

export default api;
