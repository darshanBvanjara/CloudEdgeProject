import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001",  // adjust if using Docker ports
  withCredentials: true,             // if you’re using cookies
});

export default API;
