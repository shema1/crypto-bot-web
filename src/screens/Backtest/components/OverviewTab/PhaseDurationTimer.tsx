import type { FC } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import {
  useRunDurationSeconds,
  formatRunDuration,
  computeRunDurationSeconds,
} from '../../../../modules/backtest';

export interface PhaseDurationTimerProps {
  startedAt?: string;
  finishedAt?: string;
  isActive: boolean;
  durationSeconds?: number | null;
  formatRunningLabel: (duration: string) => string;
  formatFinishedLabel: (duration: string) => string;
}

const PhaseDurationTimer: FC<PhaseDurationTimerProps> = ({
  startedAt,
  finishedAt,
  isActive,
  durationSeconds,
  formatRunningLabel,
  formatFinishedLabel,
}) => {
  const liveSeconds = useRunDurationSeconds(startedAt, finishedAt, isActive);
  const finishedSeconds = durationSeconds ?? computeRunDurationSeconds(startedAt, finishedAt);
  const displaySeconds = isActive ? liveSeconds : finishedSeconds;

  if (displaySeconds == null) {
    return null;
  }

  const formattedDuration = formatRunDuration(displaySeconds);
  const label = isActive
    ? formatRunningLabel(formattedDuration)
    : formatFinishedLabel(formattedDuration);

  return (
    <Typography.Text className="overview-tab__phase-duration" type={isActive ? undefined : 'secondary'}>
      <ClockCircleOutlined className="overview-tab__duration-icon" />
      {label}
    </Typography.Text>
  );
};

export default PhaseDurationTimer;
