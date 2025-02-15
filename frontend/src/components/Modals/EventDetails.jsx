import React from "react";
import moment from "moment";
import { Button, Modal, Form, Input, DatePicker, message, Select } from "antd";
import axios from "axios";

const EventDetails = (
  isEventDetailsModalVisible,
  setIsEventDetailsModalVisible,
  selectedEvent,
  loading,
  setLoading,
  setEvents
) => {
  const BASE_URL = "http://localhost:5000/api";

  const handleUpdateEvent = async (values) => {
    setLoading(true);
    try {
      await axios.put(
        `${BASE_URL}/events/${selectedEvent.id}`,
        {
          title: values.title,
          startDate: values.startDate.format("YYYY-MM-DD HH:mm:ss"),
          endDate: values.endDate.format("YYYY-MM-DD HH:mm:ss"),
        },
        { withCredentials: true }
      );

      message.success("Etkinlik başarıyla güncellendi!");
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: values.title,
                start: new Date(values.startDate),
                end: new Date(values.endDate),
              }
            : event
        )
      );
      setIsEventDetailsModalVisible(false);
    } catch (error) {
      message.error("Etkinlik güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleDeleteEvent = async (eventId) => {
    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/events/${eventId}`, {
        withCredentials: true,
      });
      message.success("Etkinlik başarıyla silindi!");
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
      setIsEventDetailsModalVisible(false);
    } catch (error) {
      message.error("Etkinlik silinemedi.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      title="Etkinlik Detayları"
      visible={isEventDetailsModalVisible}
      onCancel={() => setIsEventDetailsModalVisible(false)}
      footer={[
        <Button
          key="delete"
          danger
          onClick={() => handleDeleteEvent(selectedEvent.id)}
        >
          Sil
        </Button>,
        <Button
          key="cancel"
          onClick={() => setIsEventDetailsModalVisible(false)}
        >
          İptal
        </Button>,
        <Button
          key="update"
          type="primary"
          form="updateEventForm"
          htmlType="submit"
          loading={loading}
        >
          Güncelle
        </Button>,
      ]}
    >
      {selectedEvent && (
        <Form
          id="updateEventForm"
          initialValues={{
            title: selectedEvent.title,
            startDate: moment(selectedEvent.start),
            endDate: moment(selectedEvent.end),
          }}
          onFinish={handleUpdateEvent}
        >
          <Form.Item
            name="title"
            label="Başlık"
            rules={[{ required: true, message: "Başlık girin!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Başlangıç Tarihi"
            rules={[{ required: true, message: "Başlangıç tarihini girin!" }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Bitiş Tarihi"
            rules={[{ required: true, message: "Bitiş tarihini girin!" }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EventDetails;