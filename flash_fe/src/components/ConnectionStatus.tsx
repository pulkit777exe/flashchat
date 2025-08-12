import React from 'react';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connecting':
        return { text: 'Connecting...', color: 'text-yellow-500' };
      case 'connected':
        return { text: 'Connected', color: 'text-green-500' };
      case 'disconnected':
        return { text: 'Disconnected', color: 'text-red-500' };
    }
  };

  const { text, color } = getStatusInfo();

  return (
    <div className={`text-xs ${color} text-center py-2`}>
      {text}
    </div>
  );
};