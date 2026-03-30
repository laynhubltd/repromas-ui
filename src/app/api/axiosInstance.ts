import { config } from "@/config/api";
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/ld+json",
  },
});
