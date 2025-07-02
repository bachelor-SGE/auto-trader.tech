import React, { useState, useEffect } from 'react';
import { DAY_OPTIONS, SORT_OPTIONS } from '../../constants';
import { RegistrationModal } from './RegistrationModal';
import { LoginModal } from './LoginModal';
import { useNavigate } from 'react-router-dom';

interface ControlsProps {
  candlesCount: number;
  onCandlesCountChange: (count: number) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  timeFrame: string;
  onTimeFrameChange: (tf: string) => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onSearchClick: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  candlesCount,
  onCandlesCountChange,
  sort,
  onSortChange,
  timeFrame,
  onTimeFrameChange,
  onLoginClick,
  onRegisterClick,
  onSearchClick
}) => {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(localStorage.getItem('currentUser'));
  }, []);

  const handleRegister = () => {
    setShowRegister(true);
  };
  const handleCloseRegister = () => setShowRegister(false);
  const handleRegisterSuccess = (login: string) => {
    localStorage.setItem('currentUser', login);
    setCurrentUser(login);
  };
  const handleLogin = () => {
    setShowLogin(true);
  };
  const handleLoginSuccess = (login: string) => {
    setCurrentUser(login);
  };
  const handleCloseLogin = () => setShowLogin(false);
  const handleProfile = () => {
    navigate('/profile');
  };
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  return (
    <>
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'var(--color-bg-secondary)',
        padding: '18px 24px',
        borderBottom: '1px solid var(--color-border)',
        zIndex: 100,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '18px',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px #0004',
        borderRadius: '0 0 18px 18px',
      }}>
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Количество свечей:
            </label>
            <input
              type="number"
              min={10}
              max={1000}
              step={10}
              value={candlesCount}
              onChange={e => onCandlesCountChange(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1.5px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '15px',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                boxShadow: '0 1px 4px #0002',
                outline: 'none',
                minWidth: 70
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Сортировка:
            </label>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1.5px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '15px',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                boxShadow: '0 1px 4px #0002',
                outline: 'none',
                minWidth: 120
              }}
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Таймфрейм:
            </label>
            <select
              value={timeFrame}
              onChange={(e) => onTimeFrameChange(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1.5px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '15px',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                boxShadow: '0 1px 4px #0002',
                outline: 'none',
                minWidth: 100
              }}
            >
              <option value="day">День</option>
              <option value="week">Неделя</option>
              <option value="hour">Час</option>
              <option value="minute">Минута</option>
            </select>
          </div>

          <button
            onClick={onSearchClick}
            style={{
              marginLeft: 24,
              padding: '12px 32px',
              background: '#4f8cff',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #4f8cff22',
              height: 48
            }}
          >
            Поиск
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {currentUser ? (
            <>
              <button
                onClick={handleProfile}
                style={{
                  padding: '10px 20px',
                  background: '#4f8cff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px #4f8cff22',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  letterSpacing: '0.04em',
                }}
              >Профиль</button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px #e74c3c22',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  letterSpacing: '0.04em',
                }}
              >Выйти</button>
            </>
          ) : (
            <>
              <button
                onClick={handleLogin}
                style={{
                  padding: '10px 20px',
                  background: '#4f8cff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px #4f8cff22',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  letterSpacing: '0.04em',
                }}
              >Войти</button>
              <button
                onClick={handleRegister}
                style={{
                  padding: '10px 20px',
                  background: '#e67e22',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px #e67e2222',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  letterSpacing: '0.04em',
                }}
              >Зарегистрироваться</button>
            </>
          )}
        </div>
      </div>
      {showRegister && (
        <RegistrationModal onClose={handleCloseRegister} onRegisterSuccess={handleRegisterSuccess} />
      )}
      {showLogin && (
        <LoginModal onClose={handleCloseLogin} onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}; 