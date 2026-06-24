// src/components/ui/Spinner/Spinner.tsx
import React from 'react';
import styles from './Spinner.module.scss';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  color = 'var(--present)',
  text = 'Загрузка...'
}) => {
  const sizeMap = {
    small: 64,
    medium: 96,
    large: 128
  };

  const pixelSize = sizeMap[size];
  const centerCircleSize = pixelSize * 0.22;
  const endCircleSize = pixelSize * 0.13;
  const rayLength = pixelSize * 0.35;

  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinnerWrapper}>
        {/* ===== КОЛЕСО МАХОРАГИ ===== */}
        <div 
          className={styles.mahoragaWheel}
          style={{ 
            width: pixelSize, 
            height: pixelSize,
          }}
        >
          {/* Внешний круг (обод) */}
          <div 
            className={styles.outerRing}
            style={{ 
              borderColor: color,
              opacity: 0.15
            }}
          />
          
          {/* 8 лучей */}
          {[...Array(8)].map((_, i) => {
            const angle = i * 45;
            return (
              <div
                key={i}
                className={styles.ray}
                style={{
                  transform: `rotate(${angle}deg)`,
                  width: rayLength,
                  height: 3,
                  backgroundColor: color,
                  opacity: 0.6,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 50%',
                  marginLeft: 2,
                }}
              />
            );
          })}

          {/* Круги на концах лучей */}
          {[...Array(8)].map((_, i) => {
            const angle = i * 45;
            const rad = (angle * Math.PI) / 180;
            const distance = rayLength + endCircleSize / 2;
            const x = Math.cos(rad) * distance;
            const y = Math.sin(rad) * distance;
            
            return (
              <div
                key={`end-${i}`}
                className={styles.endCircle}
                style={{
                  width: endCircleSize,
                  height: endCircleSize,
                  backgroundColor: color,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  borderRadius: '50%',
                  opacity: 0.8,
                }}
              />
            );
          })}

          {/* Средний круг (пересекающий) */}
          <div
            className={styles.middleRing}
            style={{
              width: pixelSize * 0.38,
              height: pixelSize * 0.38,
              borderColor: color,
              opacity: 0.5,
            }}
          />

          {/* Центральный круг */}
          <div
            className={styles.centerCircle}
            style={{
              width: centerCircleSize,
              height: centerCircleSize,
              backgroundColor: color,
              opacity: 0.9,
            }}
          />

          {/* Вращающийся элемент */}
          <div 
            className={styles.rotationElement}
            style={{
              borderTopColor: color,
              borderRightColor: color,
            }}
          />
        </div>
        {text && <p className={styles.spinnerText}>{text}</p>}
      </div>
    </div>
  );
};

export default Spinner;