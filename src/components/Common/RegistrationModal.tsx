import React, { useState } from 'react';

export interface RegistrationModalProps {
  onClose: () => void;
  onRegisterSuccess: (login: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onClose, onRegisterSuccess }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) {
      setError('Заполните все поля');
      return;
    }
    // Проверка на существующего пользователя
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[login]) {
      setError('Пользователь с таким логином уже существует');
      return;
    }
    const status = login.toLowerCase() === 'admin' ? 'admin' : 'Base';
    users[login] = { password, status };
    localStorage.setItem('users', JSON.stringify(users));
    setError('');
    onRegisterSuccess(login);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      transition: 'background 0.3s',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        padding: '36px 28px 28px 28px',
        minWidth: 320,
        maxWidth: '90vw',
        width: 370,
        boxShadow: '0 8px 40px #0002, 0 1.5px 8px #4f8cff22',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        animation: 'modalIn 0.25s cubic-bezier(.4,2,.6,1)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 26,
            color: '#bbb',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = '#e74c3c')}
          onMouseOut={e => (e.currentTarget.style.color = '#bbb')}
        >×</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 38, color: '#4f8cff', marginBottom: 4 }}>👤</div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 26, letterSpacing: 0.5, color: '#222' }}>Регистрация</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 12, color: '#bbb', fontSize: 16 }}>👤</span>
            <input
              type="text"
              placeholder="Логин"
              value={login}
              onChange={e => setLogin(e.target.value)}
              style={{
                padding: '10px 14px 10px 36px',
                border: '1.5px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 16,
                width: '100%',
                outline: 'none',
                transition: 'border 0.2s',
                marginBottom: 0,
                color: '#222',
                background: '#fafbff',
              }}
              autoFocus
              onFocus={e => (e.currentTarget.style.border = '1.5px solid #4f8cff')}
              onBlur={e => (e.currentTarget.style.border = '1.5px solid #e0e0e0')}
            />
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 12, color: '#bbb', fontSize: 16 }}>🔒</span>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                padding: '10px 14px 10px 36px',
                border: '1.5px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 16,
                width: '100%',
                outline: 'none',
                transition: 'border 0.2s',
                color: '#222',
                background: '#fafbff',
              }}
              onFocus={e => (e.currentTarget.style.border = '1.5px solid #4f8cff')}
              onBlur={e => (e.currentTarget.style.border = '1.5px solid #e0e0e0')}
            />
          </div>
          {error && <div style={{ color: '#e74c3c', fontSize: 15, marginTop: 2, textAlign: 'center' }}>{error}</div>}
          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: '12px 0',
              background: 'linear-gradient(90deg, #4f8cff 60%, #27ae60 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 17,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #4f8cff22',
              letterSpacing: '0.04em',
              transition: 'background 0.2s, box-shadow 0.2s',
              textTransform: 'uppercase',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#27ae60')}
            onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #4f8cff 60%, #27ae60 100%)')}
          >Зарегистрироваться</button>
        </form>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }
        ::placeholder {
          color: #bfc7d1;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}; 