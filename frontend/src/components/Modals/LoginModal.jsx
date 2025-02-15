import React from "react";
import { Button, Modal, Form, Input } from "antd";
import "react-big-calendar/lib/css/react-big-calendar.css";

export const LoginModal = ({
  isLoginModalVisible,
  setIsLoginModalVisible,
  handleLogin,
  loading,
}) => {
  return (
    <Modal
      title={<span style={{ fontSize: "24px", fontWeight: "bold" }}>Yönetici Girişi</span>}
      visible={isLoginModalVisible}
      onCancel={() => setIsLoginModalVisible(false)}
      footer={null}
      style={{ borderRadius: "8px", overflow: "hidden" }}
      bodyStyle={{
        padding: "24px",
        borderRadius: "8px",
      }}
    >
      <Form
        onFinish={handleLogin}
        layout="vertical" 
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Form.Item
          name="username"
          label={<span style={{ fontSize: "16px", fontWeight: "500" }}>Kullanıcı Adı</span>}
          rules={[{ required: true, message: "Kullanıcı adını girin!" }]}
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
          name="password"
          label={<span style={{ fontSize: "16px", fontWeight: "500" }}>Şifre</span>}
          rules={[{ required: true, message: "Şifreyi girin!" }]}
        >
          <Input.Password
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #d9d9d9",
            }}
          />
        </Form.Item>
        <Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                backgroundColor: "#1890ff",
                borderRadius: "6px",
                padding: "20px 35px",
              }}
            >
              Giriş Yap
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
