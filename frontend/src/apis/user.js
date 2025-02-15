import { toast } from "react-toastify";
import { apiClient } from "./config";

export const userApi = {
    login: async (username, password) => {
        try {
            await apiClient.post("/users/login", {
                username,
                password,
            });

            toast.success("Giriş Başarılı");
            return { success: true };
        } catch (error) {
            toast.error("Giriş Başarısız")
            return { success: false };
        }
    },

    logout: async () => {
        try {
            await apiClient.post("/users/logout");
            toast.success("Çıkış Başarılı");

            return { success: true };
        } catch (error) {
            toast.error("Hata Oluştu");

            return { success: false };
        }
    },

    whoami: async () => {
        try {
            const response = await apiClient.get("/users/whoami");
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, data: null };
        }
    },
};
