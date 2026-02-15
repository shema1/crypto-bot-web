import type { FC } from "react";
import { useTranslation } from "react-i18next";

const StrategiesPage: FC = () => {
    const { t } = useTranslation();
    return <div>{t("strategies.title")}</div>;
};

export default StrategiesPage;

// {
//     "name": '1'
//     "strategy": "TrendFollowing",   
//     "pair": "BTCUSDT",
//     "timeframe": "1h",
//     "ma_type": "EMA",
//     "short_ma": 20,
//     "long_ma": 100,
//     "adx_period": 14,
//     "adx_threshold": 20,
//     "stop_loss": "1%",
//     "take_profit": "2%",
//     "leverage": 5
//   },