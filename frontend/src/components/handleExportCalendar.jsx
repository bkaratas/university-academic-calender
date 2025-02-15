
import React from "react";
import { Button,message} from "antd";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DownloadOutlined } from "@ant-design/icons";

const HandleExportCalendar = ({selectedCalendarId,calendars}) => {
    const BASE_URL = "http://localhost:5000/api";
    const handleExportCalendar = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/calendars/ics/${selectedCalendarId}`,
            {
              responseType: "blob", 
            }
          );
    
          const calendar = calendars.find((cal) => cal.id === selectedCalendarId);
          const fileName = `${calendar?.title || "calendar"}.ics`;
    
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
    
          message.success("Takvim başarıyla dışa aktarıldı");
        } catch (error) {
          console.error("Takvim dışa aktarılırken hata oluştu:", error);
          message.error("Takvim dışa aktarılırken bir hata oluştu");
        }
      };
  return (
    <div className="flex  items-center gap-2 p-4">
      <Button
          type="default"
          onClick={handleExportCalendar}
          icon={<DownloadOutlined />}
          disabled={!selectedCalendarId}
          style={{ width: 300, height:50}}
        >
          Takvimi Dışa Aktar
        </Button>
    </div>
  )
}

export default HandleExportCalendar
