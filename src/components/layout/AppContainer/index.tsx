import type { FC, ReactNode } from "react";
import './AppContainer.css';



const AppContainer: FC<{ children: ReactNode }> = ({ children }) => {
    return <div className="container">{
        children
    }</div>
}

export default AppContainer;