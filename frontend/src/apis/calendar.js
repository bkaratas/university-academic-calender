import apiClient from "./config";
import { toast } from "react-toastify";

export const calendarApi = {
    createCalendar: async (title) => {
        try {
            await apiClient.post("/calendars", { title });
            toast.success("Takvim Oluşturuldu!")
            
        } catch (error) {
            toast.error("Takvim Oluşturulamadı")
        }
    },

    getCalendars: async () => {
        try {
            const response = await apiClient.get("/calendars");
            return { success: true, data: response.data };
        } catch (error) {
            toast.error("Takvim Çekilemedi")
            return { success: false, data: null };
        }
    },

    exportIcs: async (calendarId) => {
        try {
            const response = await apiClient.get(`/calendars/ics/${calendarId}`);
        } catch (error) {
            toast.error("Çıktı Alınamadı")
        }
    },
};