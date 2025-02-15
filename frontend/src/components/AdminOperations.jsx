import React from "react";
import { Button, message } from "antd";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

export const AdminOperations = ({setIsEventModalVisible,setIsCalendarModalVisible,setIsLoginModalVisible,isAdmin,setIsAdmin}) => {
    const BASE_URL = "http://localhost:5000/api";
    const handleLogout = async () => {
        try {
          await axios.post(
            `${BASE_URL}/users/logout`,
            {},
            { withCredentials: true }
          );
          setIsAdmin(false);
          message.success("Başarıyla çıkış yapıldı");
        } catch (error) {
          console.error("Çıkış yaparken hata oluştu:", error);
          message.error("Çıkış yapılırken bir hata oluştu");
        }
      };
  return (
    <div>
          {isAdmin ? (
            <>
              <Button
                onClick={() => setIsEventModalVisible(true)}
                className="px-7 py-5"
                style={{ marginRight: "10px" }}
              >
                Etkinlik Oluştur
              </Button>
              <Button
                onClick={() => setIsCalendarModalVisible(true)}
                className="px-7 py-5"
                style={{ marginRight: "10px" }}
              >
                Takvim Oluştur
              </Button>
              <Button danger onClick={handleLogout} className="px-7 py-5">
                Çıkış Yap
              </Button>
            </>
          ) : (
            <Button className="px-7 py-5" onClick={() => setIsLoginModalVisible(true)}>
              Yönetici Girişi
            </Button>
          )}
        </div>
  )
}
