import type { SelectProps } from "antd";
import type { FC } from "react";
import { Select as SelectAntd } from "antd";


const Select: FC<SelectProps> = (props ) => {
    return (
        <SelectAntd {...props} />
    );
};

export default Select;