import apiClient from "./config";
import { toast } from "react-toastify";

export const eventApi = {
    getEvents: async (calendarId) => {
        try {
            const response = await apiClient.get(`/events/${calendarId}`);
            return { success: true, data: response.data };
        } catch (error) {
            toast.error("Olaylar Çekilemedi")
            return { success: false, data: null };
        }
    },

    getEventDetail: async (eventId) => {
        try {
            const response = await apiClient.get(`/events/detail/${eventId}`);
            return { success: true, data: response.data };
        } catch (error) {
            toast.error("Olay Çekilemedi")
            return { success: false, data: null };
        }
    },

    createEvent: async (eventData) => {
        try {
            await apiClient.post("/events", eventData);
            toast.success("Olay Oluşturuldu!")
        } catch (error) {
            toast.error("Olay Oluşturulamadı")
        }
    },

    updateEvent: async (eventData) => {
        try {
            await apiClient.put("/events", eventData);
            toast.success("Olay Güncellendi!")
        } catch (error) {
            toast.error("Olay Güncellenemedi")
        }
    },

    deleteEvent: async (eventId) => {
        try {
            await apiClient.delete(`/events/${eventId}`);
            toast.success("Olay Silindi!")
        } catch (error) {
            toast.error("Olay Silinemedi")
        }
    },
};
