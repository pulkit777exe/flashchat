import { memo } from 'react';
import { useRecoilValue } from 'recoil';
import { ConnectionStatusAtom } from '../store/atoms';

const statusConfig = {
  connected: {
    color: 'text-green-400',
    bgColor: 'bg-green-400',
    text: 'Connected',
    icon: '●',
    pulse: false
  },
  connecting: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
    text: 'Connecting',
    icon: '●',
    pulse: true
  },
  disconnected: {
    color: 'text-red-400',
    bgColor: 'bg-red-400',
    text: 'Disconnected',
    icon: '●',
    pulse: false
  }
} as const;

export const ConnectionStatus = memo(() => {
  const connectionStatus = useRecoilValue(ConnectionStatusAtom);
  const config = statusConfig[connectionStatus];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full ${config.bgColor} ${
            config.pulse ? 'animate-pulse' : ''
          }`}
        />
        {config.pulse && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${config.bgColor} animate-ping`} />
        )}
      </div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
});