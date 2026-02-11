import type { FC } from "react";
import { useTranslation } from "react-i18next";

const StrategiesPage: FC = () => {
    const { t } = useTranslation();
    return <div>{t("strategies.title")}</div>;
};

export default StrategiesPage;