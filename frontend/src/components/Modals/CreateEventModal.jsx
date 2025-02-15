import React from "react";
import { Button, Modal, Form, Input, DatePicker, message, Select } from "antd";
import axios from "axios";

export const CreateEventModal = ({
  isEventModalVisible,
  setIsEventModalVisible,
  calendars,
  loading,
  setLoading,
  isAdmin,
}) => {
  const BASE_URL = "http://localhost:5000/api";
  const handleCreateEvent = async (values) => {
    if (!isAdmin) {
      message.error("Bu işlem için admin yetkisi gereklidir.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/events`,
        {
          title: values.title,
          startDate: values.startDate.format("YYYY-MM-DD HH:mm:ss"),
          endDate: values.endDate.format("YYYY-MM-DD HH:mm:ss"),
          calendarId: values.calendarId,
        },
        { withCredentials: true }
      );
      message.success("Etkinlik başarıyla oluşturuldu!");
      setIsEventModalVisible(false);

      const response = await axios.get(
        `${BASE_URL}/events/${selectedCalendarId}`
      );
      const formattedEvents = response.data.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Etkinlik oluşturulurken hata oluştu:", error);
      message.error("Etkinlik oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      title="Etkinlik Oluştur"
      visible={isEventModalVisible}
      onCancel={() => setIsEventModalVisible(false)}
      footer={null}
    >
      <Form
        onFinish={handleCreateEvent}
        layout="vertical"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Form.Item
          label="Başlık"
          name="title"
          rules={[{ required: true, message: "Başlık giriniz!" }]}
        >
          <Input
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #d9d9d9",
            }}
          />
        </Form.Item>
        <Form.Item
          label="Başlangıç Tarihi"
          name="startDate"
          rules={[{ required: true, message: "Başlangıç tarihi seçiniz!" }]}
        >
          <DatePicker showTime />
        </Form.Item>
        <Form.Item
          label="Bitiş Tarihi"
          name="endDate"
          rules={[{ required: true, message: "Bitiş tarihi seçiniz!" }]}
        >
          <DatePicker showTime />
        </Form.Item>
        <Form.Item
          label="Takvim"
          name="calendarId"
          rules={[{ required: true, message: "Takvim seçiniz!" }]}
        >
          <Select>
            {calendars.map((calendar) => (
              <Option key={calendar.id} value={calendar.id}>
                {calendar.title}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Oluştur
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
