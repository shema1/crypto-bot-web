import type { FC, ReactNode } from "react";
import './AppHeaderContainer.css';

const AppHeaderContainer: FC<{ children: ReactNode }> = ({ children }) => {
    return <div className="container">{
        children
    }</div>
}

export default AppHeaderContainer;