import type { DatePickerProps } from "antd";
import type { FC } from "react";
import { DatePicker as DatePickerAntd } from "antd";



const DatePicker: FC<DatePickerProps> = (props: DatePickerProps) => {
    return (
        <DatePickerAntd {...props} />
    );
};

export default DatePicker;