import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, 
});

export const defaultMessages = {
    success: "İşlem Başarılı",
    error: "İşlem Başarısız",
}
