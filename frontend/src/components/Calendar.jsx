import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/tr";
import { Button, Modal, Form, Input, DatePicker, message, Select } from "antd";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import HandleExportCalendar from "./handleExportCalendar";
import { CalenderSelect } from "./CalenderSelect";
import { AdminOperations } from "./AdminOperations";
import { LoginModal } from "./Modals/LoginModal";

const Calendar = () => {
  const BASE_URL = "http://localhost:5000/api";
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isEventDetailsModalVisible, setIsEventDetailsModalVisible] =
    useState(false);
  const [
    isNonAdminEventDetailsModalVisible,
    setIsNonAdminEventDetailsModalVisible,
  ] = useState(false);
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);


  moment.updateLocale("tr", {
    months: [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ],
    monthsShort: [
      "Oca",
      "Şub",
      "Mar",
      "Nis",
      "May",
      "Haz",
      "Tem",
      "Ağu",
      "Eyl",
      "Eki",
      "Kas",
      "Ara",
    ],
  });
  moment.locale("tr");
  const localizer = momentLocalizer(moment);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/whoami`, {
        withCredentials: true,
      });
      setIsAdmin(true);
      return true;
    } catch (error) {
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/calendars`);
        setCalendars(response.data);
        setSelectedCalendarId(response.data[0]?.id || 1);
      } catch (error) {
        console.error("Takvimler alınırken hata oluştu:", error);
      }
    };

    fetchCalendars();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCalendarId) return;

      try {
        const response = await axios.get(
          `${BASE_URL}/events/${selectedCalendarId}`,
          { withCredentials: true }
        );
        const formattedEvents = response.data.map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_date),
          end: new Date(event.end_date),
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Etkinlikler alınırken hata oluştu:", error);
      }
    };

    fetchEvents();
  }, [selectedCalendarId]);

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


  const handleLogin = async (values) => {
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/users/login`,
        {
          username: values.username,
          password: values.password,
        },
        { withCredentials: true }
      );

      const isAdminUser = await checkAdminStatus();

      if (isAdminUser) {
        message.success("Admin girişi başarılı!");
        setIsLoginModalVisible(false);
      } else {
        message.error("Sadece admin kullanıcılar giriş yapabilir.");
        setIsAdmin(false);
      }
    } catch (error) {
      message.error("Giriş işlemi başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (values) => {
    setLoading(true);
    try {
      await axios.put(
        `${BASE_URL}/events`,
        {
          title: values.title,
          startDate: values.startDate.format("YYYY-MM-DD HH:mm:ss"),
          endDate: values.endDate.format("YYYY-MM-DD HH:mm:ss"),
          eventId: values.eventId,
        },
        { withCredentials: true }
      );

      message.success("Etkinlik başarıyla güncellendi!");
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === values.eventId
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

  const handleCreateCalendar = async (values) => {
    if (!isAdmin) {
      message.error("Bu işlem için admin yetkisi gereklidir.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/calendars`,
        {
          title: values.title,
        },
        { withCredentials: true }
      );
      message.success("Takvim başarıyla oluşturuldu!");
      setIsCalendarModalVisible(false);

      const response = await axios.get(`${BASE_URL}/calendars`);
      setCalendars(response.data);
    } catch (error) {
      console.error("Takvim oluşturulurken hata oluştu:", error);
      message.error("Takvim oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };


  const messages = {
    allDay: "Tüm Gün",
    previous: "Önceki",
    next: "Sonraki",
    today: "Bugün",
    month: "Ay",
    week: "Hafta",
    day: "Gün",
    agenda: "Ajanda",
    date: "Tarih",
    time: "Saat",
    event: "Etkinlik",
    noEventsInRange: "Bu aralıkta etkinlik yok.",
    showMore: (count) => `+${count} tane daha`,
  };

  return (
    <div>
      <div className="flex bg-black p-4 items-center justify-between">
        <div>
          <img
            style={{ width: "400px" }}
            class="logoresim"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAg0AAABtCAYAAAAic1LnAAAgAElEQVR4nO2dfXzU1ZnonzMMIQkhhAAhIqWISCmXUkRqWZciKlrW9Vpr0VrX67reFr0ua123q63bLZf147W06+XDqvUiKkWKlABFXgxggAFCCCEJeX+fZDKZzGQm8/7+fp77x/x+4ZfJvCe8yfP9fPiQOa/POb+Z33nOc55zDgBBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEATxlYZdawFShXOexRi7GxGXAsCdALAUABYwxrJSLQMR9QDQCACXGGO1iFgjk8l6r4zEBEEQBPHV4rpWGjjn0wBgDWPsB4i4hjGWJ40Phjh4g0Gb1x/W+YOhQV8g5MjLnuCblCMHndUtz84anzuOscLcCfLi7Cz57NwJ8hF1IGI9ABwBgMMymezi1WkZQRAEQdx4XJdKA+d8DQD8PWPsKWm40eHpGbR5Tpsc3lqHP9hod/uVz6z8pp6x5M346Fxb3sSQbNa0ggkLJ2VPuLNoSu49Mybn3J87YfxQGkRsBYAdAPCpTCbTj3GzCIIgCIIYKzjnz3POG1CAc0SdxaUob9Wu33m2eeFY17ddUVfwl4vKNa0a0wd2j8+IEjjn2zjnY14nQRAEQRCjgHP+LOe8QxywbU6f9mKn/je7FO0LrpYMCoVCfrRe9Xj3gO1glPLwMSLOvVpyEARBEAQRA0RcwTmvEAdovdXdcqxe9Twipl3W+Tbt+n3nOh4ub9W+UtmtXzwaufZWti+u6zFsi1IefjOaMgmCIAiCyABEBM75liHLgsunPXyx+/lEeTbsOT+vVmlcFh1eUoKyrTU18nqV6ZeVHbrHv7zU+9PDNd0rPjvbvri0tDNLrC8TdpzuWNCkHtwpURzaOOf3Z1QYQRAEQRDpwTlfxjlvEwfik019m7YIg3sizrVoX2vsHfwgOry2W/+Gxuhsk4aV1auWICKWKJqLAQAMNpfG4vC0KBSq7Fhll17ozP+iWrkIEWWx4refarl/wOqW+Frwt1JrLUEQBEEQGcE5XycOvDqzq+GDY3V3p5p3u6JtjmbQcfxApWqONPx8u/adYCg8zJSw/3zXUkTE7Yq6gm0nGovCYY6IiOpB2wExzblWzSstGvNBAICS8u7ZnTqL4nj9QG4iGcrqet+SKA4KRJyWqvwEQRAEQaSIdDmiumtghMUgGRu2K7IREc+29L8hDa9o63/V6fH7pWFbSi9NC4bCuOd8c2FZY+/Tequr62BV18KIZUOzGABANejoNljd5sjftp0XOnRvpyLHn063rfL4AwZBcTBwzpek2xaCIAiCIOLAOd8vKgx7KzoT+i4AAFxo120506wZ4TugHnRUmhyebmnYl/XqF3mU08IHJ+pmIiJ+Vtld1NZv2tatt7YAAJjsnpNeX8AIAGB2epwnGvpeAgBARCy91LPyYFXXQuWArfyftpQmXC75P3+pKlTpbWckVoeHkvcCQRAEQRAJ4ZyXISKGwmH/trKmVYnStmsszwAA2N1ep9nlM0bHl9Z2P4KIKPWBOFLbM9vrD/pNDk+HymAv69RZToZCYYPZ4a0tKSmRuf1BVDRqPgYAKFE05yEiNvYa37K5fQPbFarsCx26db5gCAEATjT2PSb4QuRF1x2L5j7TkJMkIj6WRrcQBEEQBCGFc34SEVFv81h/+5fauGcufHSyYb7DG9AqB2zlAABfVHXPR0T8c0XrIjHNltLOrCPVPXcjIp5oUL8izb+jvHl2i9r0Rr1qcFNFm3bjsdqeJ8W4Ly+pnjpe3ztH/NygHnxZsA54AQA8voC3SW3aBgBQqzQ85/YFgiUlwx0it51oLIone1l97xaJxWFNyp1DEARBEEQEcUnC4wvYt5RWxz0cae+5jp+GwuHgyYa+XwNEdkkAAAw63OreQXvZb0tq8ht7jZs9voDxdHPf5pJznU+faelbORrZapX6dX863fb0oYvdj0csF5emAQAcqu5Z53D7h5Y6/lTevoZzHq5XDZYlKq++x7BZojiM2BZKEARBEEQcOOfvICJ6/cFwrUoX18KgNjqOIyJ+cKJu5oYDdQV2t79bbbArAADKLvUtQ0S0OX2aPqOjQtHU99QTJSUxt0RmymNvH1ja1md+Wvx8vlX7S6Pdo31P0ZzX1m8+gIh4oUO3a0tpwyyFQiHfe6FjRbyyNEbnx6IFAxGLx1JOgiAIgvhKwjl/Wpx1t/RZEloE7C7/+5wjltWrn3V4/YYvanpeBgCo7TLsutQ9+Max2t71pxp6kx6m9GmFsuizs+2Lj9WpVu081frwht0Vjxyu6Xlo/4XO5bvPdc7dHud8hmgOV/c8i4gY5hxNDnfXH080D20J5Zx/gYh4qEr5crz8FpevTDwEKpX6CIIgCOKmBRHnigpDj962LlaaI43qgrK63t07TrWuBADwBUPliIgfnWvLAwCwuHzdDm9A/dsDF++JV89HJxvmn2nuf6lFY9o9aHO3+QJBL8aBc44Or9+gNtrP1HTpNx26qFyzYbsiphJx7waFvFFtfLOqa2CjNNzjD+xHRNxR1rrcHwh5K9q1MbeMIiL4AkGNUPWOVPuNIAiCIG46xEun+s2OnbHi6/pMM00Oj9Ph8VkREQ/VtE8DAEBEe7/RcdTjDxhqlfr3Y+UtKevOP9va/5LaaK8QD2vKFKvbP9DQO7j1wMWuuIoJAIBWi7kWl3ezyxvwewNB9ScnWlcL7Qw395m+eP6jz0fssqhq7Z/P+ZDC8nj6vUgQBEEQX3E4528jIvoDwYFY8TXdlnx/MISNvcbNAABmh7eac447FM0rvmzovd/u8Rt2KdpH+Ay8p2jOu9g18Kbb6zePSlOIQ++gvexQlTLmEsjmI7ULEBHPdwysB4ic53CouvtVAAC9xV1bqRycFytfh862TlAagoiY8JRJgiAIgrip4JzPEQfhc226EbsHevrt8412r6ZLZ30bAKCp13yPxuQ0dg1Yz3DO8U/nOmKeqqho6vupw+sfuBLKQjQdWsveT840zYqW4XBV99NhzvHdo3WrACKKw77zHevF+KMNPfNjyW52es8IisOeDLuVIAiCIL56iNdb6y3uj2PF1yj1LyNGTmg8Wt1bjIhY1al9GgDg88qOu/V657BzEN7ac2maUmc9fDWUBSmBYMi9v7LzuWj5Pz7RvBYRcceZ1mf/5dPjuaUNnbP+cKSxQD3oUCMiVigHRpzjoGhWFYvlcs6XjlFXEwRBEMSNC+f8fkRErz/oLU1wW+Xeio6NiIhGu9tdpdTH3RFxuKZ7hd3jN15thUFKXffI2zS3Hm1c7fEH/QAAOxTNK0LhcLC1z7Snvte42RsIaGK1pUFl3CgoDU2Z9C1BEARBfKUQr7luUpvibkUUKa1VvYGIeKKh7yWMcQ31qx+dXnsNdYVh9A46jkfLt/VQTa7F5VMgRrZlHqntmQ0AEAqHBwYsrq2x2uz1B51Ckasz6V+CIAiC+ErAOX8IEdHrD1pTzfPLT8t/EQiFWhSIcmn4rrOtT3kDwWukIsTmTIumPFr+JrXplV2n2pZWK3UPc86HTo+0urzhRrVphGJQ32tYj4jIOW9Jt3+JGxNEFJXftddalngg4lLOeTcibrrWslwpELGAc14m3H9TcK3licfN8CwIAgAAOOfViIgXOnWvRMeV1irvv9QzWN5vdGgcbn8X57zC6vRpPzzWuDk6bX2P4aGrrxIgRm/cdHr8bh4VaHf7T8Zrv8ZkP+jyBvb+6XTbokAojK195i3RaTZsQJnbF3AiInLO745VDvHVQhgAEBFr08mHiJuEfGsxMuB1C2WN+YDHOd8q+ZpftwPqaEDEdZI2XrcK3M3wLAgCOOfzEREDwZB/a02NPEa8inNuVTRpnmnuM75lc/uwW2/bbrb7hl3qdKF9YE4gGB7N2J8x/mDIb3J4uvtNjqYurWW/2xuwxkrXa7DHXHooKSmRhTlHty8QbtWYD8brq+ouw5uIiJzzuGmIrw6c89eE5/1aOvnwKioNiLhaqGvvWJd9vYCIc69kH44VN8OzIAjgnL+PiNjeb4k5oNap9I+FwhHzfWXHwFMd/ZajsdK5fEFxVnZNuKTU/wYAoFlt3J8oXWu/+Smp3NsVqmyN0dHt9Qfte843F4rh7x2pnR3dxj1nO6eJ5XDOC6PjCYIgCOIrDefciYi4v7xjcbw0GpNjj88fHNCYHSdLL3SOOAOh1+DYEn+YvvJ4/UFnU+/g1hMNvS/pbe62cDi+xSMQCmF5o3potlKDKDc7PFsOVKmWAABUdwzc7fEHDJxzLKtXjzikSjVoP4mIyDl/MY0+fk2sP1Y8CjMpodyhdVsxT/RMN1FfCPlHHP2Nl2dBiHGcOYW8KMiyNBXZE4ESs3Ki2XqUbLHatDWWzFLZkjBXUldSeWL0R8LbUYW0W8W+S5DmtVhpxHowwQw1Qd5hzyeqTxI67YrPh3NuxcjR8Qmfg4Sh75dE9hEI1oG4/SzIWhuVrVYIH/qNYozvrmTpKBVWC+UkhXM+bPKEiEvxsuVIyiaMWioZzW+FIG4IOOcrERFtLr86WVpERL3VPcLKUNGuXZDGjzdldBanqkap3xvtmxALl8dv9waCQUREziP3VCQs2+wcsbxQ263fotRbv2jsNe7oNdjP1HYZ1pscnhEDwJmW/icj9fDKNPo57ssEoxSG6D4XwlNWGiR5hjmNYRKlIUphmCsJz/hFKH2xJxpMMfXBalNU+V81pSGuXKkqDUKYuDyX0Ewu+d5tBUjrOaSkNEjaNKSECvUU4EhlITpPmST9NVEacLgvRcKy4z0LgrheyfSq6R8BALRoTH9MlrCq0/CT/Nzxi0s7h5/hMG/G5DG/0Ckc5ry+c+B7y+YVP1HXM/hZsvQTc7Lys8fL5QAAjAEwxhKmv6Uw79GyS33DTrycNTV/rccfbu3S2bYwAH7XHTPeC4Y4fFnX+7A03cV+05FgiANjbPlolygwMrsrY4zNBYBLMpnswTTzv86iAIDfAQAwxlZjDItDLDjnZUJ6G2PsQcZYT/qtGSHbWsbYXES0CeXOTVGeB6PaczsA7BPiXsM4s+fofohi1O25WjDGRsxgM+Bt4f+1KFGYpCDiauF7B4yxWN7+Dybozw9jlHcixnfxBcmzl9bxKwAQlYgnovI8AQD74sg0hEwmu12aDxE/FOToiSHviShZR/xuRGQy2QtCmgIAEJWpEwAwRSLjFER8XZDzBBDEDUimSsNjAADdupFnGUTj9gVkGpPrfNWuO0JiWFmjanlRwcRR7yToHrCW2F3+3qHPeuf3H14+vx8A4K55M/7O4fXXi3EtGtN/uf3BvtHWueBrU4btkOgzOD7IGT9uwY/uueNSwaTsBSWK5uI+k/v384on/7M03b9+f4mn3+w8J3x8KNP6oxUGAHgg07KkMMZeF1+gEHk5JyRKYXhgrAZYRHxB+PNtuDyIvRAneVwYYz2MsScQUZQr7TJuNBBxG0pm5ukSNajH7C9h0BMH+yuiVDHGPmSMvS78vVrSJnHm/yFjbF9Unn2MsSeug8F4SDlljL3AGLNJPttkMtnvGGNPXBvRCGL0pK00cM5nMcZmewOhkHey+2Ky9HfeNv33FpevbuNGxsWwOdMmb0yUJxXCYYR5Mwt/rLE4/wkAoEdv+/AbswqGvTDqW/R/AwAQCoWVi2ZP/3lHvyWp9SEZs6bl3bO3qmuh+Lnd6vivWVPz1gAAXFIZNy68vXjDrKm5f11UkDviBk2txfmF8Oe9mdQtzGL2ShUG6UtpDOgGAGCMJfQ055xvjVIYLo1F5cIsdrUgwz7JwLA0nqUgBXqEsq9b7/nRgog9wrMoQMS9mbaVMWaTzLzXRZeDiHMlz+dKnykgVUgKhfotwufV8Swh1wFDv8cxsPwQxHVHJpaGuwEA9DbP2ReWLRuyHiAi7K3sWrVLEbnuGgBg24nGonFyltussvw/MWznmdbiebdMyXimLdJndJwCAOjROS66/QFTU7f+X6LT3PudOXqt2XnM5PKdAABo6rXtHm29AAALiib/XPz7fyyf72jTWD51ewNN/+3WqX8/JTdrebPaXF3fMzhiNqEzec8Lf45wlEyG8AI/CZEBtAci5tmxVBgAIiZ9QMS45QoKwzoAAGFmNyYKg4Bo4v1QsBT0SAax1zMsUzSlx2xTKmvONwA94uxVUCjjni2SDFEZEBSQYctCEitDT4IZfUxfhXS3n4Lw3AQsgkxbhf/nAkC3cHBT3KWnsYZFloBita1MkuYERBT6ofSc89cyaD9BXJdkojTcCQBgsLovSAP/9+nT8ge/PXv306u+YdRb3LVHa1TPLZ83802729/6szWLxBkCTMvLfnaUMgMAQO+g/SAAQNYE2b8bbJ5Tj634pitWuvLW/p8HgpELo55bvaDR5vHrR1v3bTMmP/VESclQ3y2dN+N/Orz+kN3jMzVc1H/3+0vn/NeK//a10s/Otc082ah5WKFQZQMA6MzuxlCYA2NsEec83SuzT4Kwniu8NMd05oyIm0RlAC4vC0QjTQOjMYXHqH8uAKwFAGCMDTniiX9HmalTKg8RRasMgLDO/FWFMXZColgtxQxPFxQUNVEhGFqiEJTWJ4U0V9TKIFg5Ngl/nxAVU8HyNLTkxBhbLcgiKiqbrhOL0gOSpT5gjG2SKBy1ZIEgbio454cREY/U9Iz44v/hSGPBqaa+5zUm5xmn1+9HRDx2SfW0NI160FGVYHaXMn86234PAECH1qzYfa41oeVCbXQcPVLT8yQAQO+g/fhY1L+nvHPY7AYR4c/lHYurOgd+OWB21np8AW9Dj/FoVbtu94GLXUPbTQcsLtHzfMQV4jH6epiXP+fcKvFct2J8ZzUxfdq7JzDyUou3e0KaRiTmCzBdj3DJLoIROw4kuxGit7Wl5LUfnS8Tb/V4fRqnLVd194S0HunpguIMN07eRDtzpP26NkoGK45ctki6LTdGm1LZPWHFOIoiRg6/eg1HbmuslaRJZbtw0v5P59nHyLs2zhbRod8N7Z4gbiQysTQsAADw+kNKaeD+CmXRS48stt3/rdmffG3apHsn5UyYcLq5/75WlemUmGa7oq7g1qmjd4AMhTlwr69+u6KuAJjM9ZMVC79MlF5ncVVMzZtwHwCAzR0YtTMkAMDtxfnDdizU9Qzu+fGK+Q3f/NqUfw2GuU05YN94otPwd99dMPMnj31nnk5M5/IGROfMtNZk8bL/gGiGLgCAsT5B7neMsbuSLHu8AJGZlOgrsA1Hub6Mw2exIxQByTr6ugzqekL0bL9OEQerRDtqbgeIv8QiRWjrkHkcANLaWSPkOyF5vmLfDTmoXoFlsVhckslkU+Itf0mcCl9njDEcbmW5bmbyjLF9gpx3AcDteNkxN6mzMUFcj2SiNMzliBD0+nTSwG99feoBncXxkvhZbTTOLMyb8JNXf/SdoeWA/OyJy8bJMt2wcZlxMuZ59vtLPLMLCu92ugP9ydKbHJ5LedlZ2QAAg1aXJVn6VJg+OWeY8hNC/ubO0y135OdkT51dNPmBxbdN/+3986f/9EClag5jl51AvcGwqLSMOOwqEaLDofASFf0llmIGR89i1NYxFMzRyV62Qr4PGWM2xtiDeNn5blQXAiHiumTOl5K08WQc2uoHka1tNiF92oPm1UTcgSD044jZsFShAoBUdwYMKXWiwpWBXKJvw2qMLF2JviH7EudMD4zachk1+M+NShv3OxK18+OanroaT07BT2dfojQEcb2T9gjOGJO5fYFQxzjz8MFXhseLp0x6X/w4q3CqNj83e9jAOHPKxDFZAw+FuRwAIISYDwwHkqXv1rv6kDEPAMDE7KzRay0AMHVS9qINCsXQnRt3z7ul+dn7Fg2zvtxWPPlfiyaPXy4Nc/kCory3pFOfdMbFGNsnebmuHa2TFWMs3r74RDL0MMYeEP6eCwDbMqlbeHn+Svg77j54SXt/leyFKyg1PxP+Xnc9zTyjEZ6lOKvfK5UVL/tliO1NyS9DaP8TmMChNQVKJPlfE+T5kF3hsytkMtnvQLCUQJQlDRE3iadF4vAltAIY/v27ZtsuBUXHKix7rI2KW4uXnUuv9dZQgsiIjAbQUAj0G++7LyQNmz+z8D8MVleN0eH+2GT31Fk9/nO3zcj/W2maKXk5t49GWBHGWBYiQhDRpTY5HMnSP7Dga7bxcmYBAMjJlo/JLGRidta0O7KKZoqfERG2lHZmbVc0F+880bxwz9nOleEwtwURhvVTiHNR2RqVHDKZ7HcoOFuxUR7sIwwEovPja5iiw6GgRIhm67XxFI7o5QbJGnE3ADwpDoosxuE/krrEto7w6o+Tfh8IhzthAge5eLIJjKiHxfGgj5c+FYQBvkdcchILA4BuiaXghXQGbMEq9bNM5BHy2yDKIZZJHFQTkOh46FSdUUW5l4oKsfD8VjPG5gpWEKukn6wgONFiRPG8UudHxH32ok8ECr9DFnEY3itNA5Ht0gXCs6ZrsIkbkoyUBm8oFHMGc0vhpO/kTch63hcMu6ZNyvledLxcJitOVrbbFwwkSyMfJ4MDF3vmMx7ul8tknmTps3MA7G6/GQBgat6EhcnSB0McvP5g0nJzmXyoPbsr2mf+7P457r/73jcHfnLfwpYf/tXtZybnTJgXCoZ90jwOt1/c5ZGXrPxkyGSyF/Dy0sI2HMXWM0EJEcvaiyn6DjDGPsTLVoC0t5bh5W18HyZaK2eSMwQgcmJgKubdn+FlC8p1e4OgMMDfhYiv40jrwO8A4K5EClWCcqUWqUzkGlqKwMgywlWZHTPGLolyCwP1asGH4XaIPPtYJ0t+CAAPCpaKa4ZQ/+3CsxymvGDkPI3XhVMpb5jTRglCSuJzk2OAiOjw+i9Nzs2+Swwrq+nOL54+6S2Lw9+99Pait1s1ltereg2HVs6YMbhkyS1Dg6/W7FDMLJy0KlH55a3af2tUaT/5+rTpRTnZ8oXT87PvvXXaxNVTJ+XOk6Y71dj/s0aLad99t936+JI5RZ8kKvP90sbFs6blzvvB3fP+4vIG/BOzxw8daR0K80CfyXGqz+g86Q2GLlrNwX479+b+8Dvz9hdPmTg/Ublf1qu+//07534JAHCoRptbPFn+uNsXtHmDfr3R7B28d8nXdtrdgZpvz5k+dIZEq8b0+DdnTd2PiH+RyWQ/SlQ+QRAEQdzQICK6vYFaadjHZzunGR1uldPjd9vc/oFgKOz1BoLB/ZVdj0rTeXzBygSmXURE9AeDqj+U1i/56Mu2mSjZgfS7I1XF1V0Dm8V0Roe3qqSkRLb/fMdjyWT+85mOlVvLmmfvrehcIuYfMDtrj0bdD1FS1p3/zsHaeadb1G8kkxMRUWt1J6y7W2c72W9yKKRhKoPjccGcuT+Z3ARBEARxQ4OIqDW5mpKlO3BBuXTDpxVF0jCT3VuRymAswjlHtzdg7je5zhyr7V7/hyONBVvLavIbe43bERErWnQr3zvSXPzOnvMJ/QP+eLJl5ZbSziyLy9vBOXfuO9+xGgBgX0XHylaN+WOL09ftD4bi34sdh/Nt/Y8k7AOFqqCipX+JNOzQxZ4nhezXrbmcIAiCIGIhT55kJNkTZCPW40/U9c28/dbJv7J7/F39Fqfre/Nn/fvEnPE/B4BDYhq7N+Camp89ojyb29euHLB/aXH5qv2+cK/B7XY8dvf8gN8byq7s0c79+rT8OxfMmv7gwq9N/4He5r54srlvU3u/ueKvF8z6R4PDucGWNTkEwlGz0WytqZFnBcPtD8yb8ZLR7tXtOd/ztzPyJyxr7TfvzR4nK3D5Qr3VSsOmIA+3P3znnMHjDRrZoM2Te0tBTlH+xAmLCidm3zt7et79E8bLRwius7iHOWEqB6xHp0/KnaezOE8HODrcgeDBe+bPPCtNM2VSVh4AACLGPMGSIAiCIL4yICLa3F4vRh1e5vQFur3+oNXl8xsQEc+19v/mZJN6mDNdj8G+K3q2rmhQP5dq3XvO92WXNfS9VK8ybPuTovWRA5XKh2u7DGs+OFw3c8MGjOnUuaOstXB/hXLRn8+0PVRS2b5C0dj36zqVYcvO001JT2QU+fR4fa7Z5e2Kll16cdXBC+1zEBGVOttBRER/IBRERDxU3f2KtKyzrf2vClaUzanWTxAEQRDXAxlZGiZOyMr+9ERbIUhm9+EQZh9o6PvGZBmDpfOmKVYsnPUf0fksDm//bUX5w8KmTMr+dqr1/vie2T4A+AMAQGV7/5MqozvQ2W+pX/T1Qs+CvNOyjRuBR+eZMmWyz+wcdHX1uxz3LZ493+p1ldy3eHZnGs2FokmF2ROz5DOlYf5gOGBx2C8fLDVOvlxjcpyfN7PgB0qd9fCBJvWP/2bBrTunT8oZthukICdrBgAAY8yQjgwEQRAEca1Je8slIvbLx8lgQi4MG0Rtbq+ycBws+8Ff3T4ol8l8W8tq8qPzunzBluiwb99W9MrZds3idOX4qwWzSoxO6ym9L5A18K3Zjvuizo0QeXTZrR5ZaIKjcHKO7cFvf/3Tx7+7MC2FAQBg6cLCwxPGy4ddMOX2B5QvPLhsaHmiePLEOW5faHBDSXNWzgR5UVY4N5Q9flyhzuxol+bLkstnA0T6MR0ZEPFdRNwc7/PNBEbO8a+71nIQBEHcbGRiaWgHgFlZ8glzAKBZDETAwNSC3AUAUOoNhHzF+ZPvOaBQXXhs1Rxb5GRfgNZ+y4V7F408Pfmu24oPgHC+fjr8/OHlDgBwlJTEXpoQ+fsHF1ogjs9DMto05nXTJ0+8Jzq8b9BVI/08Iz/nXpPbNzhnOixEQPnE/HBWXs6EYqeXDVMa8nLk4pJGb5qiLAcYdlBU9OebiXOQ4RkjBEEQxFWEc/4OImJlW/8b0vBGten3Yc79Sp1FIa75D9o82q01NcMUE4c34vMQTSgUrri6LUmOxuhcFW/nxIfRLhIAABafSURBVJf16helafecbX+mqmtg4YUOw+LTzepXd51qW2p2eLXSNNsVqmyvPxgWfBqu6fn41zOIuApHcVDV1eRaynoj9RNBEDcpnPNnEBE7+s0HpOFbjzXdo7e4qnUWV9mZFu3zh6q6lh+r6777iZKSYTPC2m79dung6/D6De39lv2c87B60K6A64Q957oeRUTs1lkUBpu7nHM+TGn45EzTMJPJl5dUT7drzW9Kww6d7xp2HPMORdsyQWFQpSMLIuYhoni9rlP4V4uIv0TEuCdLIqIKI0coZyPiSkQMI2LSEzGvNYhoRER7gniRtKwNmeZLUmaqskoxI2I1Iv4i0fMbbd1jASJaY8hvRcRKRHz8Ctf9sljflawnTt0pfVdu1N8YQVw1EHEBIqLT44v7stp6qCa3vFmzzukN1J5u0rwrjSut7b1f+vaxuXyqDSXNWQAAVrdvwOkNaDcfqV2QqXz/+UX9/N1n2p7LND8AQEWbdjMi4g5Fy4vC541SpUFncVZJ0zf1GBYjIjb0Grcfudj9TJfOcnLn2eYRL44Tjb3rERE55ztTlQUR5yNit1B1EBEbELFO+BuFl1bM/kLE5cLg5BXSvRQr3fUGIqoRUZ0gPqUX+ljlS1JmqrKWS/61CYMLCs920ZWoeyzAy0pDUCJ/rUT+jO7bSLHuG0FpuCF/YwRxVeGcWxER/3iicZgDY6vWst7h9rk55+jxBeytGtOew9XKh6Pzu33DlygsTp/mP/9SNR8A4FK3YbPb5x8416Z9/5NjTWldH/1JWdOyUDgyuNd2DWxJt12ldb3PDFic1VaXt+3dL2tnAgCcbtG8i1Gcae5/VpqvS2s9U99jfEvom6DD7e8IhkLO0s7OrGHpdNbDiIic85RetBixMKiEavciYpEkbhoi7hbiVDiKGev1BiLOQ8R5CeKvJ6UhI1kRcSYi7pE8vxGOw6OteyyQKA3WqPBHhfDuK1j3da80EASRApzznYiIZQ3qYWcQfHKq6aUBq/OD47XqIbN8WaP61aZe0/PSdOdatK9FD8SIiKcae18GiNwY2aIxvdPab957vk339on6vqcO1nYv3q5oLv70eH3u1q01Ixw4LykNmxERL/UY3tmuaF6CiGj3+LX/74vGYecxbNiAMoVClb2rvLFgV3nH3M8vdK061aB+uaHH+HGX1rL3fLtuDQDAltKGWQarpzpaRpc34JZeif3bspp8g80zAABQ1zP4drPauA0AwOzwakuam7Ok9bq8Ab+gNMxOpZ8RUTzOujbWywsRZUIcIuIbUXFFGLnEagAR3RiZIa6IfhlKPq9AxJOI6IwqZ42Q14kRc/hORJwVlUbkcUEecdb1agyZsxHxTUTsENJpEfEDHH7VccIXdqx4RMxCxLcwMnP3I6IGEY8i4kNJ8qXTvhF9lImsUfHirZC/lIQVIeLvEbFF6CMzIlZg1HJAdNmJ5Ey1rTHki6c0ZAvh4ajwVGVP5XnFVBoQ8TdCeJcofwZ9lvC7mqBvpd+ddH9jpIAQNyec88cQEfUWd9Jtb1a3z1jfM/i+NGxDSXOW1x/0Ywx0ZlfX/krlU2LaveVdC0819q08VNW1fPfZ1vlbSi/P3r+sVc8826p5k3MeRkT87GzbsOuhVXrbGUREpd525nBNz0PSuBJFc/FnpzuX/LmiY+XBC53Ld5S1FgIAHKhsm9OmMe+IJRsi4ulmzbBbHE82qn/ZrbceBwBwevzOT4/X555t0b6mMTuOS9Mdu6RejYjIOe9I3sMRMLIMgZjA2Q0RVwtpGiRh0zDyEkZEtGPEfGrHyMs53gvNK6aVlPMcXjZDqzAy0CMiGhBRei24FA1GXtwi6yXpciVtcgpymYXPLYiYHVVeOkrDjqhyVcLn5+Ply6B9sfoobVmj4sXlujpJmKgsqoT+kh5x/tME7UkkZ0ptjSFfPKXhKSFcGxWequypPK9hSgMiyiX5OnD4M0q3zxATf1dFYg78mNlvjJQG4uYEEbPENf6S8uahWfN7iua8TxWtW945WPuMGGZz+dx7z3WsiC7jQqf2FUyCyeGtq1cNbmroMT178ILyqUPVynXn27Vv9Zude61On8YfDCEi4tnm/qHzChp7B3fYXf7u947WLQQA+LxKucxkd7chInr9QX+f0VHRqBp8v6nX+Is95R3PHqhSPn1RqX9ZPWjf7w+GvInk8fqDzujtneWtmmcREQdtnso+o70cAMDl8dv3nuscpqR06ix7EBE558MsAkn62S1UHdd0jZGBGBHRKwn7QAg7icKyBUaWOsrwMtEvtOMoWeIQ0juFuO2S8DdjhGGMMNGa1CIJ2ySEnUHBsoCRGecujMw6R6M0iH01VxJ2NyLKY+XLsH3D+ihTWaPiC4R4qyRMjoiLJZ/XSsqR9uewsuPJmU5bY8gndYSU+mSI/D4qfaqyp/K8hpQGRMzHyPcZhfqLQUIGfZbsuxqvb8XPmfzGSGkgbl4453sREetUhmE7Bhp7Des9/qDX4wsc79Xbfq0csDXEK0Ops37R3m+u7tJaK4f901mq1IOOjkG7x2xyeJw6s8vcrbdpfYGgNsy5Vmd2NLRpzB98XqUcWnp493D9Q1aXt0PyA8UGlXGYX4Oiqf/FfqPjqNsfVA3aPAM9eptWa3EZDHa3c9DhduqtTk33gK0uWp4OraVSOWCpq+0eGHZB1ZeXlPO2ltXkl9WrnjfZvXVldapVbl/Aa3F6q6XptitU2ZL7sIYdrZ0IyYs10Q6JWEqDOANaFJV2QYIX2uKotI9J4qx4ecAQLQUGSVqROZKwQiHMLwkTHToTHuaV7CUbKx4jToGIEXPxakQcsaVVmi/D9o2QOxNZo+JFpcEeFf4URnweFIhYJSlH2p/Dyo4nZzptjSFfrN0TUt5ByUCfhuypPK+XJXmlFoHi6LQZ9NkcSVis76pIPKUhk98YKQ3EzQvn/B5ERJfPb4yO++hcW96FLt2WQDAU7B6wHQAAON2ieXnXmY67x1KGEkVzcX2P4Rdmu0c68xmBymDfs7eya9VY1g0A0G9yHA2FOUrLvtQ98Hxzs2HYIH+mWbMOEZFzXjWikARg5ssTook0OyqtPMELLTrti4n6FCVr2ZKw6MEjui7RkjPy1rIE+VKJx4iZP/oMkAqUbH+T5suwfSPkzkTWqPhYyxNvYgIS9G9MOdNpawz54i1PzMTIqaSIiB9kIHsqz+vlEQVE+EUMOdPts2Tf1WSfM/mNkdJA3NxwzlWIiOUt/Wtjxe863TIPETEcDgcRET871/ZodBqlzv4w53yAc25I5V8wFDaLPgyZEgiGnKnWxzk3+kPho7F+8J8ca5pVq9S/j4hodfo0h2tUj8XqB6vTp0FE5JwnvEo7GkziCCmkEZ01fy0JE2dx0TPOham+0PCyd/yIcmLIEK+M6LpES0PCLYbxykuhPjlGHNFexshsExGxK1a+sWjfaGSVxIsm9zckYeJg+jgKg5uknFSUhoyfZQz5YioNQlyeECd1DE1JdiE82fOSKg17MbLkEMbI9s/lUWVl1Gep9mWMz6P+jRHEjQgbTWZEfA4AtlvcfuXUvOw7pHGKpr5fL59/y7/4g2FPp872F63W++8/vO82W3QZzc2GvGAubLM4fcUcoR/5iDunhuAAkC0fB4yxUCDMPYEQd4U5DzA28qKqaGSMycfJZLlZclneOJksKxAOy8JhnvgsYgbZUyblzM7Jkm1eNLvoz/GSvX+sadaab8/6eG5xwUPlLdr/GrR5D6xdccdpAIAL7frHvvuNGQcQ0SSTyaYnk1MKRpYlmgBgDgD8GQD+kTFmEeIKAWALADwDAH0A8C3GmEOIex8AXgKA0wDw3xljLqGsAwAgWi3GMca45IU6jjE21I+ImAsAAwCQDwBHAOBHjLEARsy6DzPG/iBJG6+MYeGI+DYA/BIATgHADxljDkTMAoDtEDlW+03GmC9eeYnqQ8RVANDMGDMJn6cBgBEAfIyxnOh8AJA92vYli0vSNzMBYDMAPCm0/U7GmE2IcwJAHgDcxhjrxYgj3zYxLxPOZY/Rv6N+ljHktwJAAQDYGGNTouIeBYCDAOBgjE1OU/ZVkPx5vQyR77g0n/gd6gOAb4+2zyRtSdiXMT6P+jdGEDcio1IaAAA452bGWGGN0vCD79xRfEgMb9VY3vEHQ7mfq1v+aWOcy6SkbDvR9Ehx/sQXwjwM42SjFmvUIAB4/WHTj7/3jX9INc8fjtcXrf7W7K3+YLjxW1+fvgEAwOkJqPJyxs8BgH9gjP0xbTkiBzd9AQBzASAAAK1C1EIAyILIgPO3jLFWSZ5pAFALALMBwAEAnQAwHyIDZRYAcMbYOCFtogHxaQDYCZF7HkwAoBPqlUFESWlNVEaMF20uAFQAwBIAcEHkHpO5AFAotOuuTJQG4WWtFtrXCAB6AFgqtL+EMfbjOPlG1b5kcVHx5yTB0wBgHkTufumFyKDTLMmzHQCeg8h9Kf0AMGw2m67SIKRNqa0x5BeVhhAAXJBEFQr5AQD+kzH2r6nKnsbzEpWGIYVFmK2fBIBVAPA5Y+yHo+kzSTvTVRrG5DdGEDcdGNnKhXaPX5s8dXwOVyrn2d2+Cs55C+f8OOf8i2v4r4Jz3mW0u9+6/HtPn+ouw7OIiJzzEX4f6YARZ0fpMdJujPg7xD1GGkfuIa/Ayx7lRkk6kXjm81UY8ca3CuVUIeJjUWlilhErHK/AOQ0YMXOvx4hzn7jW3I2Ib6NkzTmOPBm3L01ZpVgx8ixfwxg7YzDyvLdi5CwFN1423SNi+ssT6bQ1Rp54jpBOIf9LUemTyo6pP6945zQUYeR7gxhRLDLus1T7MlY+HKPfGEHcSIzJlJ5zrmKMzenR2391+y0Fvx1tecfre+8PBJFfi0sccyZkyUO+QPuau+9I6+rqaBQKlN+zImzPko/LhYgp/vMxEjElMGL+Pc8YCwifZRAxh78MAH9hjP3oaspztRDa/TYA/DXN6q5/buTndbP+xoibm0yuxh4BY+x/AED5bTMmv32isfuT1YtvH8y0rNLSziyHJ/C3Dy35+tPZ48fJxo+TheDKaw8yAJB7AyFZj8GhO69z/CNETJwZM3eRc1uWfFIuIl6UyWRXW2F4DCJrqz5E7IOI+XQORMziHgDYeDXlucpkQ2RtezcA/Pgay0Ik54Z8Xjf5b4wgRo94boPd5UtrW2EyarTa3LEsL14dOIpliGjqe43SS7nmjFnBKYKR3QHPY8Qz34gRb3MDRjzQM7oc6UYAIwdFFSPiI3gF70QgxoYb+XndrL8xghgzj0OMrFUbGWN5bTrrrxbeWjjqZQoAgHe/qJ//jVsL/ldB3oQ8gIjAE8bLYXL2+ORbJqKQyRj4/GFw+PwwpCJwgBaNueofHlj00VjIe6hGm7v6W0UDOVnyfET8lUwmG5N+IJKDiHcDQBlEZnr/whj77BqLRCSAnhdB3ORwzodm2I19gyvHqtwOtW0u53yR9J/O4pndaTLl10ScqmSJ/ikQ5X19fdnKAWeRz4cLost6T9E8ZjdE2ly+ckREznnlWJVJEARBENcDY763kXP+FmPsjVCYB5p11tvunD1NN9Z1AAD88x/PzyyePH5Jfk7WzPFyWe44mQwCwVBo3DjGJ4yXcbeHy8aNB7kcmDwY5gF/KGzrM3k6f//3K2quhDwAAHqr690ZBRPXI6KHMXaruIecIAiCIL4KjIkjpBSZTPZvnPOl8nGyNfOm51ee7+v7xj2zZ/vGup5vz5oKRYVZMHViTtHkvPHfyJLLZxfmTZgWCvNcty8oK8zLCbh9AZvLH9AFQ9Bjcnhapk70hBQKVfZ999025vJ06qyvzCiYKN6S9wApDARBEASRIpzzFsTITZUlJSXX/f5khQIzVqAutPU/Ly7LcM6fSZ6DIAiCIIghEDGfc65BRKxXGar/aUtpViblnG/TvdhntFd06ay7z7f1v7jn/PmElx2lypbSzixFk+aZLp11t9npafv8gvLhTMr5pKzx+UAwLCoMr46FbARBEARx08E5LxIVB6Pd0/K7kqqYV9omYsDiKjvfpn3/2KXe32jNLsWgzdNU3TUgLgPAR5+3JXRi3LABZUdqVQv+eLJpLgDA6SbNqi6d5bjJ4VX3Gx0NKr39OCLi/gpl2tukTjb0/UJiYXgjeQ6CIAiCIOKCiNM4522IiB5fwPzekfq0rsc+Wtf78P7zXUvFz+1a8w6n148AAIN2d5nN5dMYbO6mQaur6lRT39s1NTVyAICy+r41fUZHhcHm7hi0u9X+YCisaO5bf66t/9HeQfuBwzU9DwEAVLRpXx6wuLpi1x6fCx3a9yUKwyvp5icIgiAIIgac8yzOuXgFMB6qVr6YSr7yVu3vfYGgqkdv368xO2rbNKZyfzAUrO4aWH+yUb0WEXHryaZ79lV0PVTRqn3NHwxhn9GxvaRKVRwOc7zUbdh6vE790Luf184sa1C/gjFOcAqFw1it1K9LtS3/92h1sdpoPyNRGJ5Opy8IgiAIgkgBzvnQ7Lyxd3DXb0tqRlzWI/JESYkMETEcDqv3VXSsLClvW3qiXv3Iqfq+hwAA1Eb7meY+0xfSPA0qw0aDzd1ypE61xOryhqPLdPkC/j1n29eInxWNmmcCoXDKR0HuPN3ypDcQdArKgoFzfk+qeQmCIAiCSBPO+XOi4uD0+I27T7fFnKkjoqysqfeRynbdu71Ge7lSb/2iXjW46dCFyLLCgNVtr1cZt0nzNKqN+3v0tnJEBF8ghJ9f7JkvjQ+FOe4/37UeAGBrTY3cHwyhcsC2P5nMmz6vnVnfM7hLYl04zDkvzLwXCIIgCIJICc75PM65QhyEuwesR3eeblqWKM+hKuX9jb2m98VBvl41uAkR8aJyYFtFm/blg1XK5xARFc19vwYAMDk8Ts5518WOgV9UtPV/bHZ6Wty+gLFDbZsLAPD0H44UnGvvf7UkwWmQJSUlspMNfb/wBoJB8l8gCIIgiGsI5/xFzrlTHJCb1KZdn51rS6g8SNlX2fGc3uo6rDY6Kqwub4tSZ9mzVXCErFcNLlEPOiq1Fmd176Dj4InGvt/sLO2MuxwipaSkOet4Xe9LNpdPI1EWDnDO52baVoIgCIIgRgnnvJBzvhkl9OhtXxy51PNoDL/FK8rus63zq7sGNjq9fqNEnFrO+SNXVRCCIAiCIOKDiHM45+9KlQeLwzugHLC8c/hC94oNG/CKnCr5ybGmWVVd+p9qjI7jnPOhujnn1ZzzJ69EnQRBEARxIzLmF1aNFs55EQA8BwD/kzE25Mho8/gsJpv3lNHuPaOzeS/5w57Wv/ve4rTud9iwAWULHmibN2Vi7qLiwty/mp6fs6qoIHeZXHZZH0HEPwPANplMdmqMmkQQBEEQXwmuO6VBCud8JQD8AAAeZ4zNkcb5AiFw+gI9Pn+ox+kL6fyhkMkTCNunTcoOTJ2Uzds0FvmknKxJAFCQn5NVNCFr3OyJE+TzJ0/Mzo9uNCKWAsABADgik8n0V6NtBEEQBHGjcV0rDVI454sBYAVj7LuIuIwxtjCTchDRAgA1wr9Kxtg5upGSIAiCIJJzwygNUhBRhojzAGAuAMwCgGIAmAoAeTD8um8PANgAwAgAOgDoAwClTCYzXV2JCYIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgrnP+PwBqMMF0OfNXAAAAAElFTkSuQmCC"
            alt="T.C. KIRKLARELİ ÜNİVERSİTESİ"
          ></img>
        </div>
        <div className="text-white text-xl hidden lg:flex ">
          <h6 style={{ fontFamily: "fangsong" }}>
            KIRKARLERİ ÜNİVERSİTESİ AKADEMİK TAKVİM{" "}
          </h6>
        </div>
        <div>
          <AdminOperations
            setIsEventModalVisible={setIsEventModalVisible}
            setIsCalendarModalVisible={setIsCalendarModalVisible}
            setIsLoginModalVisible={setIsLoginModalVisible}
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
          />
        </div>
      </div>

      <div className=" md:flex gap-4 p-6 bg-gray-100 m-4">
        <div className=" p-4 gap-4 bg-white border border-gray-300 rounded-lg shadow-sm h-[250px] md:h-56 mb-3">
          <CalenderSelect
            selectedCalendarId={selectedCalendarId}
            calendars={calendars}
            setSelectedCalendarId={setSelectedCalendarId}
          />
          <HandleExportCalendar
            selectedCalendarId={selectedCalendarId}
            calendars={calendars}
          />
        </div>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: 700,
            width: "100%",
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "10px",
          }}
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            if (isAdmin) {
              setIsEventDetailsModalVisible(true);
            } else {
              setIsNonAdminEventDetailsModalVisible(true);
            }
          }}
          messages={messages}
        />
      </div>

      <LoginModal
        isLoginModalVisible={isLoginModalVisible}
        setIsLoginModalVisible={setIsLoginModalVisible}
        handleLogin={handleLogin}
        loading={loading}
      />

      {/* //!Event Edit İşlemleri */}
      <Modal
        visible={isEventDetailsModalVisible}
        onCancel={() => {
          setIsEventDetailsModalVisible(false);
          setSelectedEvent(null);
        }}
        footer={[
          <Button
            key="delete"
            danger
            onClick={() => handleDeleteEvent(selectedEvent.id)}
            className="py-4 px-6"
          >
            Sil
          </Button>,
          <Button
            key="update"
            type="primary"
            form="updateEventForm"
            htmlType="submit"
            loading={loading}
            className="py-4 px-6"
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
              eventId: selectedEvent.id,
            }}
            layout="vertical"
            onFinish={handleUpdateEvent}
          >
            <Form.Item name="eventId" style={{ display: "none" }}>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item
              name="title"
              label="Etkinlik Başlığı"
              rules={[{ required: true, message: "Başlık girin!" }]}
            >
              <Input />
            </Form.Item>
            <div className="flex gap-6">
              <Form.Item
                name="startDate"
                label="Başlangıç Tarihi"
                rules={[
                  { required: true, message: "Başlangıç tarihini girin!" },
                ]}
              >
                <DatePicker showTime format="DD.MM.YYYY HH:mm:ss" />
              </Form.Item>
              <Form.Item
                name="endDate"
                label="Bitiş Tarihi"
                rules={[{ required: true, message: "Bitiş tarihini girin!" }]}
              >
                <DatePicker showTime format="DD.MM.YYYY HH:mm:ss" />
              </Form.Item>
            </div>
          </Form>
        )}
      </Modal>
      
      {/* //!Event Detay */}
      <Modal
        title={
          <h2 className="text-lg font-semibold text-gray-700">
            Etkinlik Detayları
          </h2>
        }
        open={isNonAdminEventDetailsModalVisible}
        onCancel={() => setIsNonAdminEventDetailsModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsNonAdminEventDetailsModalVisible(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg px-4 py-2"
          >
            Kapat
          </Button>,
        ]}
        className="p-6 rounded-lg shadow-lg"
      >
        {selectedEvent && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg shadow">
            <p className="text-gray-600">
              <strong className="text-gray-800">Başlık:</strong>{" "}
              {selectedEvent.title}
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-800">Başlangıç Tarihi:</strong>{" "}
              {moment(selectedEvent.start).format("DD.MM.YYYY HH:mm:ss")}
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-800">Bitiş Tarihi:</strong>{" "}
              {moment(selectedEvent.end).format("DD.MM.YYYY HH:mm:ss")}
            </p>
          </div>
        )}
      </Modal>

      {/* //! Create Event */}
      <Modal
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
            padding: "15px",
          }}
        >
          <Form.Item
            label={
              <span style={{ fontSize: "16px", fontWeight: "500" }}>
                Etkinlik Başlığı
              </span>
            }
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
          <div className="flex gap-6">
            <Form.Item
              label={
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  Başlangıç Tarihi
                </span>
              }
              name="startDate"
              rules={[{ required: true, message: "Başlangıç tarihi seçiniz!" }]}
            >
              <DatePicker showTime />
            </Form.Item>
            <Form.Item
              label={
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  Bitiş Tarihi
                </span>
              }
              name="endDate"
              rules={[{ required: true, message: "Bitiş tarihi seçiniz!" }]}
            >
              <DatePicker showTime />
            </Form.Item>
          </div>
          <Form.Item
            label={
              <span style={{ fontSize: "16px", fontWeight: "500" }}>
                Takvim
              </span>
            }
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
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="py-5 px-7"
              >
                Etkinliği Oluştur
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* //! Create Calender */}
      <Modal
        visible={isCalendarModalVisible}
        onCancel={() => setIsCalendarModalVisible(false)}
        footer={null}
      >
        <Form
          onFinish={handleCreateCalendar}
          layout="vertical" 
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Form.Item
            name="title"
            label={
              <span style={{ fontSize: "16px", fontWeight: "500" }}>
                Takvim Başlığı
              </span>
            }
            rules={[{ required: true, message: "Takvim başlığını girin!" }]}
          >
            <Input
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
                className="py-5 px-7"
              >
                Oluştur
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Calendar;
