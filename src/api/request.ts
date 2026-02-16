import axios from "axios";

const request = axios.create({
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor: unwrap data
request.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Error]", error);
    return Promise.reject(error);
  },
);

export default request;
