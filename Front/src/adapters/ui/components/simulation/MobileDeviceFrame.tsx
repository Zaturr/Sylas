import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import './MobileDeviceFrame.css';

type MobileDeviceFrameProps = {
  children: ReactNode;
  deviceLabel?: string;
  onHomePress?: () => void;
  showHomeIndicator?: boolean;
};

export function MobileDeviceFrame({
  children,
  deviceLabel = 'Dispositivo simulado',
  onHomePress,
  showHomeIndicator = true,
}: MobileDeviceFrameProps) {
  const [timeLabel, setTimeLabel] = useState(() =>
    new Date().toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  );

  useEffect(() => {
    const updateClock = () => {
      setTimeLabel(
        new Date().toLocaleTimeString('es-VE', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    };

    updateClock();
    const timer = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mobile-device" aria-label={deviceLabel}>
      <div className="mobile-device__shell">
        <div className="mobile-device__bezel">
          <div className="mobile-device__screen">
            <div className="mobile-device__status-bar">
              <span className="mobile-device__time">{timeLabel}</span>
              <div className="mobile-device__island" aria-hidden="true" />
              <div className="mobile-device__status-icons" aria-hidden="true">
                <span className="mobile-device__signal">●●●</span>
                <span className="mobile-device__wifi">⌁</span>
                <span className="mobile-device__battery">▮</span>
              </div>
            </div>

            <div className="mobile-device__content">{children}</div>

            {showHomeIndicator && (
              <button
                type="button"
                className="mobile-device__home-indicator"
                aria-label="Volver atrás"
                onClick={onHomePress}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
