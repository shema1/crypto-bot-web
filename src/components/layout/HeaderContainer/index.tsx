import type { FC, ReactNode } from "react";




const HeaderContainer: FC<{ children: ReactNode }> = ({ children }) => {
    return <div>{
        children
    }</div>
}

export default HeaderContainer;