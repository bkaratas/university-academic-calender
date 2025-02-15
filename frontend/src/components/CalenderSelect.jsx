import React from "react";
import { Select } from "antd";

const { Option } = Select;

export const CalenderSelect = ({ selectedCalendarId, calendars, setSelectedCalendarId }) => {
  const handleCalendarChange = (value) => {
    setSelectedCalendarId(value);
  };

  return (
    <div className="flex flex-col items-start gap-2 p-4 ">
      <p className="md:text-lg text-sm font-semibold text-gray-700">
        Size Özel Takvimi Seçebilirsiniz
      </p>
      <Select
        style={{height:50}}
        value={selectedCalendarId}
        onChange={handleCalendarChange}
        placeholder="Takvim Seçin"
        className="w-full border border-gray-400 rounded-lg "
      >
        {calendars.map((calendar) => (
          <Option key={calendar.id} value={calendar.id}>
            {calendar.title}
          </Option>
        ))}
      </Select>
    </div>
  );
};
