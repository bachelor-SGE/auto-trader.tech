import React, { useState, useMemo, useCallback, useEffect, CSSProperties, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { TICKERS, FUTURES_TICKERS } from './constants';
import { Candle, YScale } from './types';
import { useData } from './hooks/useData';
import { useAnalysis } from './hooks/useAnalysis';
import { Controls } from './components/Common/Controls';
import { StockChart } from './components/Chart/StockChart';
import { AnalysisModal } from './components/Analysis/AnalysisModal';
import { SecretPanel } from './components/Common/SecretPanel';
import { Loader } from './components/Common/Loader';
import { SORT_OPTIONS } from './constants';
import { SearchSetupsPage } from './components/SearchSetups/SearchSetupsPage';

const ALL_TICKERS = [...TICKERS, ...FUTURES_TICKERS];

// Заглушка AdminPanel
const statusColors: Record<string, string> = {
  Base: '#888',
  Pro: '#27ae60',
  VIP: 'gold',
  admin: '#e74c3c',
};
const statusOptions = ['Base', 'Pro', 'VIP', 'admin'];

const AdminPanel: React.FC<{ users: any[], onUpdate: any, onDelete: any, onStatus: any, onCreate: any }> = ({ users, onUpdate, onDelete, onStatus, onCreate }) => (
  <div style={{ padding: 32, background: '#222', color: '#fff', borderRadius: 12, marginTop: 24 }}>
    <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 18 }}>Админ-панель</h2>
    <table style={{ width: '100%', background: '#222', color: '#fff', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1.5px solid #444' }}>
          <th style={{ padding: 8 }}>Логин</th>
          <th style={{ padding: 8 }}>Пароль</th>
          <th style={{ padding: 8 }}>Статус</th>
          <th style={{ padding: 8 }}>Действия</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.login} style={{ borderBottom: '1px solid #333' }}>
            <td style={{ padding: 8 }}>{u.login}</td>
            <td style={{ padding: 8 }}>{u.password}</td>
            <td style={{ padding: 8 }}>
              <span style={{ color: statusColors[u.status] || '#888', fontWeight: 700 }}>{u.status}</span>
            </td>
            <td style={{ padding: 8 }}>
              <button onClick={() => onUpdate(u)} style={{ marginRight: 8, background: '#4f8cff', border: 'none', borderRadius: 8, padding: 8, color: '#fff', fontSize: 18, cursor: 'pointer' }}>✏️</button>
              <button onClick={() => onDelete(u)} style={{ marginRight: 8, background: '#4f8cff', border: 'none', borderRadius: 8, padding: 8, color: '#fff', fontSize: 18, cursor: 'pointer' }}>🗑️</button>
              <button onClick={() => onStatus(u)} style={{ background: '#4f8cff', border: 'none', borderRadius: 8, padding: 8, color: '#fff', fontSize: 18, cursor: 'pointer' }}>🔄</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <button onClick={onCreate} style={{ marginTop: 18, padding: '10px 18px', background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16 }}>Добавить пользователя</button>
  </div>
);

// Общий layout с боковой панелью
const LayoutWithSidePanel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const login = localStorage.getItem('currentUser');
  if (!login) return <>{children}</>;
  const users: Record<string, any> = JSON.parse(localStorage.getItem('users') || '{}');
  const currentUser = login ? users[login] : undefined;
  const status = currentUser?.status || 'Base';
  
  // Обёртка для перехода в журнал с проверкой статуса
  const handleJournal = () => {
    if (status === 'Base') {
      alert('Повысьте уровень до Pro');
      return;
    }
    navigate('/journal');
  };
  const handleSearchSetups = () => {
    navigate('/search');
  };

  return (
    <div style={{ display: 'flex' }}>
      <SidePanel
        onHome={() => navigate('/')}
        onUpgrade={() => navigate('/up')}
        onSearch={handleSearchSetups}
        onFaq={() => alert('FAQ (заглушка)')}
        onSupport={() => alert('Поддержка (заглушка)')}
        onProfile={() => navigate('/profile')}
        onJournal={handleJournal}
      />
      <div style={{ marginLeft: 80, flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

const features = [
  {
    label: 'Сетапы для поиска',
    values: [
      { ok: true, value: '2', progress: 2 },
      { ok: true, value: '10+', progress: 10 }
    ],
    type: 'progress',
    max: 10,
  },
  {
    label: 'Запросы в день',
    values: [
      { ok: true, value: '5', progress: 5 },
      { ok: true, value: '∞', infinity: true }
    ],
    type: 'progress',
    max: 100,
  },
  {
    label: 'Дневник трейдера',
    values: [
      { ok: false },
      { ok: true }
    ],
    type: 'bool',
  },
  {
    label: 'Расширенная поддержка',
    values: [
      { ok: false },
      { ok: true }
    ],
    type: 'bool',
  },
  {
    label: 'Доступ к закрытому чату',
    values: [
      { ok: false },
      { ok: true }
    ],
    type: 'bool',
  },
];

const cell: CSSProperties = {
  padding: '20px 0',
  fontSize: 18,
  borderBottom: '1px solid #333',
  textAlign: 'center' as const,
  minWidth: 120,
  fontWeight: 600,
  verticalAlign: 'middle',
  letterSpacing: 0.1,
  background: 'none',
};
const featureCell: CSSProperties = {
  ...cell,
  textAlign: 'left',
  color: '#fff',
  fontWeight: 700,
  minWidth: 260,
  paddingLeft: 18,
  fontSize: 18,
};
const iconStyle = (ok: boolean) => ({
  fontSize: 22,
  marginRight: 8,
  color: ok ? '#4f8cff' : '#888',
  display: 'inline-block',
  width: 24,
  textAlign: 'center' as const,
  verticalAlign: 'middle',
});
const valueStyle = (ok: boolean) => ({
  color: ok ? '#fff' : '#888',
  fontWeight: 700,
  fontSize: 18,
  verticalAlign: 'middle',
  letterSpacing: 0.1,
  display: 'inline-block',
});

const renderFeatureRow = (feature: any, idx: number) => (
  <tr key={idx}>
    <td style={featureCell}>{feature.label}</td>
    {feature.values.map((v: any, i: number) => (
      <td style={cell} key={i}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          {feature.type === 'progress' ? (
            <>
              <span style={valueStyle(true)}>{v.value}</span>
              {v.value !== '∞' && v.progress !== undefined && (
                <div style={{background:'#333', borderRadius:6, height:8, width:70, margin:'10px 0 0 0', display:'flex', alignItems:'center'}}>
                  <div style={{background:'#4f8cff', height:8, borderRadius:6, width:`${Math.round((v.progress/feature.max)*100)}%`, transition:'width 0.3s'}} />
                </div>
              )}
            </>
          ) : (
            <span style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
              <span style={iconStyle(v.ok)}>{v.ok ? '✔️' : '❌'}</span>
            </span>
          )}
        </div>
      </td>
    ))}
  </tr>
);

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const login = localStorage.getItem('currentUser');
  React.useEffect(() => {
    if (!login) navigate('/', { replace: true });
  }, [login, navigate]);
  if (!login) return null;
  const users: Record<string, any> = JSON.parse(localStorage.getItem('users') || '{}');
  const currentUser = login ? users[login] : undefined;
  const status = currentUser?.status || 'Base';
  const isPro = status === 'Pro';

  return (
    <LayoutWithSidePanel>
      <div style={{ 
        background: 'var(--color-bg)', 
        minHeight: '100vh',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          background: '#232a3a', 
          color: '#fff', 
          borderRadius: 16, 
          padding: 36, 
          maxWidth: 600,
          width: '100%',
          boxShadow: '0 8px 40px #0004'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 24 
          }}>
            <h2 style={{ 
              fontWeight: 800, 
              fontSize: 28, 
              margin: 0 
            }}>Сравнение тарифов</h2>
            <button 
              onClick={() => navigate('/profile')} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#fff', 
                fontSize: 26, 
                cursor: 'pointer',
                padding: 8
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ 
            background: '#1a1f2e', 
            borderRadius: 12, 
            padding: 20, 
            marginBottom: 24 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <span style={{ fontSize: 18, color: '#888' }}>Ваш текущий статус:</span>
              <span style={{ 
                color: statusColors[status] || '#888', 
                fontWeight: 700, 
                fontSize: 20 
              }}>
                {status}
              </span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr>
                <th style={{ ...featureCell, background: 'none', color: '#888', fontWeight: 700, fontSize: 20 }}>Функционал</th>
                <th style={{ ...cell, color: '#888', fontWeight: 700, fontSize: 20, background: 'none', textAlign: 'center' }}>Base</th>
                <th style={{ ...cell, color: '#ffd700', fontWeight: 800, fontSize: 22, background: 'none', textAlign: 'center' }}>Pro ⭐</th>
              </tr>
            </thead>
            <tbody>
              {features.map(renderFeatureRow)}
            </tbody>
          </table>
          
          {status === 'Base' ? (
            <button 
              onClick={() => { 
                alert('Купить подписку (заглушка)'); 
                navigate('/profile'); 
              }} 
              style={{ 
                width: '100%', 
                background: '#4f8cff', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                fontWeight: 800, 
                fontSize: 18, 
                padding: '14px 0', 
                marginTop: 8, 
                boxShadow: '0 2px 8px #4f8cff22', 
                cursor: 'pointer', 
                letterSpacing: 0.5 
              }}
            >
              Купить подписку
            </button>
          ) : status === 'Pro' ? (
            <button 
              onClick={() => { 
                alert('Продлить подписку (заглушка)'); 
                navigate('/profile'); 
              }} 
              style={{ 
                width: '100%', 
                background: '#27ae60', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                fontWeight: 800, 
                fontSize: 18, 
                padding: '14px 0', 
                marginTop: 8, 
                boxShadow: '0 2px 8px #27ae6022', 
                cursor: 'pointer', 
                letterSpacing: 0.5 
              }}
            >
              Продлить подписку
            </button>
          ) : (
            <div style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
              У вас уже максимальный уровень
            </div>
          )}
        </div>
      </div>
    </LayoutWithSidePanel>
  );
};

const getOrSetUserMeta = (user: any) => {
  // Добавляет дату регистрации и конец подписки если их нет
  let changed = false;
  if (!user.registeredAt) {
    user.registeredAt = new Date().toISOString().slice(0, 10);
    changed = true;
  }
  if (user.status === 'Pro' && !user.proUntil) {
    // Просто +30 дней от сегодня (заглушка)
    const until = new Date();
    until.setDate(until.getDate() + 30);
    user.proUntil = until.toISOString().slice(0, 10);
    changed = true;
  }
  return changed;
};

const ProfileFeatures: React.FC<{ user: any; onChangePassword: () => void; onDelete: () => void; }> = ({ user, onChangePassword, onDelete }) => {
  const status = user.status;
        return (
    <div style={{
      background: '#232a3a',
      borderRadius: 14,
      padding: '28px 32px',
      marginBottom: 36,
      color: '#fff',
      boxShadow: '0 2px 12px #0002',
      maxWidth: 520,
      marginLeft: 'auto',
      marginRight: 'auto',
      fontSize: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }}>
      <div style={{display:'flex', alignItems:'center', gap:12, justifyContent:'space-between'}}>
        <span style={{fontWeight:800, fontSize:22}}>👤 {user.login}</span>
        <span style={{
          color: statusColors[status] || '#888',
          fontWeight: 700,
          fontSize: 18,
          border: `2px solid ${statusColors[status] || '#888'}`,
          borderRadius: 8,
          padding: '2px 14px',
          background: '#fff',
        }}>{status}</span>
      </div>
      <div>Дата регистрации: <b>{user.registeredAt}</b></div>
      {status === 'Pro' && (
        <div>Конец подписки: <b>{user.proUntil}</b></div>
      )}
      {status === 'Base' && (
        <div>Осталось запросов на сегодня: <b>5</b></div>
      )}
      {(status === 'Pro' || status === 'VIP' || status === 'admin') && (
        <button style={{background:'#4f8cff', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:700, fontSize:16, cursor:'pointer', marginTop:4}}>Вступить в закрытый чат</button>
      )}
      <button onClick={onChangePassword} style={{background:'#27ae60', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:700, fontSize:16, cursor:'pointer', marginTop:4}}>Сменить пароль</button>
      <button onClick={onDelete} style={{background:'#e74c3c', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:700, fontSize:16, cursor:'pointer', marginTop:4}}>Удалить аккаунт</button>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const login = localStorage.getItem('currentUser');
  // --- CRUD state ---
  const [users, setUsers] = useState(() => {
    const usersObj: Record<string, any> = JSON.parse(localStorage.getItem('users') || '{}');
    return Object.entries(usersObj).map(([login, data]: any) => ({ login, ...data }));
  });
  const [editUser, setEditUser] = useState<any|null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteUser, setDeleteUser] = useState<any|null>(null);
  const [statusUser, setStatusUser] = useState<any|null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  React.useEffect(() => {
    if (!login) navigate('/', { replace: true });
  }, [login, navigate]);
  if (!login) return null;

  const usersObj: Record<string, any> = JSON.parse(localStorage.getItem('users') || '{}');
  const currentUser = login ? usersObj[login] : undefined;
  const status = currentUser?.status || 'Base';

  // --- CRUD handlers ---
  const saveUsers = (newUsers: any[]) => {
    setUsers(newUsers);
    const obj: any = {};
    newUsers.forEach(u => { obj[u.login] = { password: u.password, status: u.status }; });
    localStorage.setItem('users', JSON.stringify(obj));
  };
  const handleUpdate = (u: any) => setEditUser(u);
  const handleEditSave = (user: any) => {
    saveUsers(users.map(u => u.login === user.login ? user : u));
    setEditUser(null);
  };
  const handleDelete = (u: any) => setDeleteUser(u);
  const handleDeleteConfirm = () => {
    if (!deleteUser) return;
    saveUsers(users.filter(u => u.login !== deleteUser.login));
    setDeleteUser(null);
  };
  const handleStatus = (u: any) => setStatusUser(u);
  const handleStatusSave = (newStatus: string) => {
    if (!statusUser) return;
    saveUsers(users.map(u => u.login === statusUser.login ? { ...u, status: newStatus } : u));
    setStatusUser(null);
  };
  const handleCreate = () => setShowAdd(true);
  const handleAddSave = (user: any) => {
    saveUsers([...users, user]);
    setShowAdd(false);
  };

  const handleChangePassword = (newPassword: string) => {
    if (!currentUser) return;
    const usersObj: Record<string, any> = JSON.parse(localStorage.getItem('users') || '{}');
    usersObj[currentUser.login].password = newPassword;
    localStorage.setItem('users', JSON.stringify(usersObj));
    setShowChangePassword(false);
    alert('Пароль успешно изменён!');
  };

  // --- Модалки ---
  const Modal: React.FC<{ children: any, onClose: () => void }> = ({ children, onClose }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#222', color: '#fff', borderRadius: 12, padding: 32, minWidth: 320, maxWidth: '90vw', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>×</button>
        {children}
      </div>
    </div>
  );

  // --- UI ---
  return (
    <div style={{display:'flex'}}>
      <SidePanel
        onHome={() => navigate('/')}
        onUpgrade={() => navigate('/up')}
        onSearch={() => alert('Поиск сетапов (заглушка)')}
        onFaq={() => alert('FAQ (заглушка)')}
        onSupport={() => alert('Поддержка (заглушка)')}
        onProfile={() => navigate('/profile')}
        onJournal={() => navigate('/journal')}
      />
      <div style={{padding: 40, paddingTop: 60, fontSize: 20, flex:1}}>
        {/* Блок профиля с функциями */}
        {currentUser && (
          <ProfileFeatures user={currentUser} onChangePassword={() => setShowChangePassword(true)} onDelete={() => alert('Удалить аккаунт (заглушка)')} />
        )}
        {status === 'admin' && (
          <>
            <AdminPanel
              users={users}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onStatus={handleStatus}
              onCreate={handleCreate}
            />
            {editUser && (
              <Modal onClose={() => setEditUser(null)}>
                <h3>Редактировать пользователя</h3>
                <EditUserForm user={editUser} onSave={handleEditSave} onCancel={() => setEditUser(null)} />
              </Modal>
            )}
            {showAdd && (
              <Modal onClose={() => setShowAdd(false)}>
                <h3>Добавить пользователя</h3>
                <EditUserForm user={{ login: '', password: '', status: 'Base' }} onSave={handleAddSave} onCancel={() => setShowAdd(false)} />
              </Modal>
            )}
            {deleteUser && (
              <Modal onClose={() => setDeleteUser(null)}>
                <h3>Удалить пользователя?</h3>
                <div style={{ marginBottom: 18 }}>Точно удалить <b>{deleteUser.login}</b>?</div>
                <button onClick={handleDeleteConfirm} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, marginRight: 12 }}>Удалить</button>
                <button onClick={() => setDeleteUser(null)} style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16 }}>Отмена</button>
              </Modal>
            )}
            {statusUser && (
              <Modal onClose={() => setStatusUser(null)}>
                <h3>Сменить статус для <b>{statusUser.login}</b></h3>
                <select value={statusUser.status} onChange={e => handleStatusSave(e.target.value)} style={{ fontSize: 18, padding: 8, borderRadius: 8, marginBottom: 18 }}>
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <button onClick={() => setStatusUser(null)} style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, marginLeft: 12 }}>Закрыть</button>
              </Modal>
            )}
          </>
        )}
        {showChangePassword && (
          <Modal onClose={() => setShowChangePassword(false)}>
            <ChangePasswordForm onSave={handleChangePassword} onCancel={() => setShowChangePassword(false)} />
          </Modal>
        )}
      </div>
    </div>
  );
};

// Форма редактирования/добавления пользователя
const EditUserForm: React.FC<{ user: any, onSave: (u: any) => void, onCancel: () => void }> = ({ user, onSave, onCancel }) => {
  const [login, setLogin] = useState(user.login);
  const [password, setPassword] = useState(user.password);
  const [status, setStatus] = useState(user.status || 'Base');
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ login, password, status }); }} style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 260 }}>
      <input value={login} onChange={e => setLogin(e.target.value)} placeholder="Логин" style={{ padding: 10, borderRadius: 8, border: '1.5px solid #ccc', fontSize: 16 }} required />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" style={{ padding: 10, borderRadius: 8, border: '1.5px solid #ccc', fontSize: 16 }} required />
      <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1.5px solid #ccc', fontSize: 16 }}>
        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16 }}>Сохранить</button>
        <button type="button" onClick={onCancel} style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16 }}>Отмена</button>
      </div>
    </form>
  );
};

const SidePanel: React.FC<{ onHome: () => void, onUpgrade: () => void, onSearch: () => void, onFaq: () => void, onSupport: () => void, onProfile: () => void, onJournal: () => void }> = ({ onHome, onUpgrade, onSearch, onFaq, onSupport, onProfile, onJournal }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
        position: 'fixed',
        top: 40,
        left: 0,
        width: open ? 220 : 64,
        background: '#232a3a',
        color: '#fff',
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
        boxShadow: '2px 0 16px #0002',
        padding: open ? '32px 18px 32px 18px' : '32px 0 32px 0',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        alignItems: open ? 'stretch' : 'center',
        transition: 'width 0.25s cubic-bezier(.4,2,.6,1), padding 0.25s cubic-bezier(.4,2,.6,1)',
        overflow: 'hidden',
      }}
    >
      <PanelButton icon="🏠" text="Главная" open={open} onClick={onHome} />
      <PanelButton icon="📓" text="Журнал" open={open} onClick={onJournal} />
      <PanelButton icon="🔍" text="Поиск сетапов" open={open} onClick={onSearch} />
      <PanelButton icon="👤" text="Профиль" open={open} onClick={onProfile} />
      <PanelButton icon="📖" text="FAQ" open={open} onClick={onFaq} />
      <PanelButton icon="💬" text="Поддержка" open={open} onClick={onSupport} />
      <PanelButton icon="🚀" text="Повысить уровень" open={open} onClick={onUpgrade} />
    </div>
  );
};

const PanelButton: React.FC<{ icon: string, text: string, open: boolean, onClick: () => void }> = ({ icon, text, open, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: open ? 14 : 0,
      background: '#4f8cff',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      fontWeight: 700,
      fontSize: 18,
      padding: open ? '12px 18px' : '12px 0',
      cursor: 'pointer',
      width: '100%',
      justifyContent: open ? 'flex-start' : 'center',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px #4f8cff22',
      marginBottom: 8,
      minHeight: 48,
    }}
  >
    <span style={{ fontSize: 24 }}>{icon}</span>
    {open && <span style={{ fontSize: 16, fontWeight: 700 }}>{text}</span>}
  </button>
);

const JournalPage: React.FC = () => {
  const navigate = useNavigate();
  const login = localStorage.getItem('currentUser');
  const users: Record<string, any> = JSON.parse(localStorage.getItem('users') || '{}');
  const currentUser = login ? users[login] : undefined;
  const status = currentUser?.status || 'Base';
  React.useEffect(() => {
    if (status === 'Base') {
      alert('Повысьте уровень до Pro');
      navigate('/profile');
    }
  }, [status, navigate]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>({ date: '', ticker: '', lots: '', price: '', direction: '', capital: '', open: '', closeType: '', closeLots: '', closePrice: '', comment: '', closeDate: '', partialClosures: [] });
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState<any[]>(() => {
    if (!login) return [];
    return JSON.parse(localStorage.getItem('journal_' + login) || '[]');
  });
  const [editIndex, setEditIndex] = useState<number|null>(null);
  const [openRows, setOpenRows] = useState<{[k:number]:boolean}>({});
  const [currency, setCurrency] = useState<'RUB'|'USD'>('RUB');
  const [usdRate, setUsdRate] = useState(90);
  const [priceCurrency, setPriceCurrency] = useState<'RUB'|'USD'>('RUB');
  const [priceInput, setPriceInput] = useState('');
  const [sortType, setSortType] = useState<'duration'|'profit'|'date'|'cost'>('date');
  // --- Импорт/Экспорт ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openCommentIndex, setOpenCommentIndex] = useState<number|null>(null);

  const resetForm = () => {
    setForm({ date: '', ticker: '', lots: '', price: '', direction: '', capital: '', open: '', closeType: '', closeLots: '', closePrice: '', comment: '', closeDate: '', partialClosures: [] });
    setStep(0);
  };

  const handleEditRecord = (idx: number) => {
    const rec = records[idx];
    setForm({ ...rec });
    // Найти первый незаполненный шаг после открытия
    let stepTo = 7;
    if (!rec.closeType) stepTo = 7;
    else if (rec.closeType === 'Часть' && !rec.closeLots) stepTo = 8;
    else if (!rec.closePrice) stepTo = 9;
    else if (!rec.comment) stepTo = 10;
    else if (!rec.closeDate) stepTo = 11;
    setStep(stepTo);
    setShowForm(true);
    setEditIndex(idx);
  };

  const handleNext = (value: any) => {
    const keys = ['date','ticker','lots','price','direction','capital','open','closeType','closeLots','closePrice','comment','closeDate'];
    setForm((prev: any) => ({ ...prev, [keys[step]]: value }));

    if (step === 6 && value === 'Нет') {
      setForm((prev: any) => ({ ...prev, closeType: 'Всю', closeLots: prev.lots }));
      setStep(9); // шаг с ценой закрытия
      return;
    }
    if (step === 6 && value === 'Да') {
      if (editIndex !== null) {
        const updated = [...records];
        updated[editIndex] = { ...form, open: 'Да', partialClosures: form.partialClosures || [] };
        setRecords(updated);
        if (login) localStorage.setItem('journal_' + login, JSON.stringify(updated));
        setEditIndex(null);
      } else {
        saveRecord({ ...form, open: 'Да', partialClosures: form.partialClosures || [] });
      }
      resetForm();
      setShowForm(false);
      return;
    }
    if (step === 7 && value === 'Всю') {
      setStep(step + 2);
      return;
    }
    if (step === 8 && form.closeType === 'Часть') {
      setStep(step + 1); // к комменту
      return;
    }
    if (step === 11) { // последний шаг — дата закрытия
      // value — это введённая дата закрытия
      let rec = { ...form, open: 'Нет', partialClosures: form.partialClosures || [], closeDate: value };
      if (form.closeType === 'Всю') {
        rec.closeLots = form.lots;
        rec.closeDate = value; // всегда явно подставляем
      }
      // --- если частичное закрытие ---
      if (form.closeType === 'Часть') {
        // Добавляем частичное закрытие
        rec.partialClosures = [
          ...(form.partialClosures || []),
          {
            lots: form.closeLots,
            price: form.closePrice,
            date: value, // сюда тоже value
            comment: form.comment,
          }
        ];
        // Проверяем, все ли лоты закрыты
        const closedLots = (rec.partialClosures||[]).reduce((sum: any, c: any) => sum + Number(c.lots), 0);
        if (closedLots < Number(form.lots)) {
          // Оставляем сделку открытой
          rec.open = 'Да';
          rec.closeType = '';
          rec.closeLots = '';
          rec.closePrice = '';
          rec.comment = '';
          rec.closeDate = '';
        } else {
          // Все лоты закрыты — сделка полностью закрыта
          rec.open = 'Нет';
          rec.closeType = 'Всю';
          rec.closeLots = form.lots;
          // --- ФИКС: переносим дату последнего partialClosure в closeDate ---
          rec.closeDate = rec.partialClosures[rec.partialClosures.length-1]?.date || value;
        }
      }
      if (editIndex !== null) {
        const updated = [...records];
        updated[editIndex] = rec;
        setRecords(updated);
        if (login) localStorage.setItem('journal_' + login, JSON.stringify(updated));
        setEditIndex(null);
      } else {
        saveRecord(rec);
      }
      resetForm();
      setShowForm(false);
      return;
    }
    setStep(step + 1);
  };

  const saveRecord = (rec: any) => {
    const newRecords = [...records, rec];
    setRecords(newRecords);
    if (login) localStorage.setItem('journal_' + login, JSON.stringify(newRecords));
  };

  const handleDeleteRecord = (idx: number) => {
    const newRecords = records.filter((_, i) => i !== idx);
    setRecords(newRecords);
    if (login) localStorage.setItem('journal_' + login, JSON.stringify(newRecords));
  };

  const questions = [
    { label: 'Укажите дату', type: 'date', key: 'date' },
    { label: 'Укажите тикер', type: 'text', key: 'ticker' },
    { label: 'Укажите количество лотов', type: 'number', key: 'lots' },
    { label: 'Укажите цену за лот', type: 'number', key: 'price' },
    { label: 'Направление', type: 'select', options: ['Лонг','Шорт'], key: 'direction' },
    { label: 'Укажите размер капитала на момент открытия сделки', type: 'number', key: 'capital' },
    { label: 'Сделка еще открыта?', type: 'select', options: ['Да','Нет'], key: 'open' },
    { label: 'Закрыли всю позицию или часть?', type: 'select', options: ['Всю','Часть'], key: 'closeType' },
    { label: 'Если часть, укажите количество лотов', type: 'number', key: 'closeLots' },
    { label: 'Средняя цена закрытия?', type: 'number', key: 'closePrice' },
    { label: 'Ваши комментарии к сделке', type: 'text', key: 'comment' },
    { label: 'Укажите дату закрытия сделки', type: 'date', key: 'closeDate' },
  ];

  const todayStr = new Date().toISOString().slice(0, 10);

  const getLotsLeft = () => {
    if (form.partialClosures && form.partialClosures.length > 0) {
      return Number(form.lots) - form.partialClosures.reduce((sum: any, c: any) => sum + Number(c.lots), 0);
    }
    return Number(form.lots);
  };

  const getLastCloseDate = () => {
    if (form.partialClosures && form.partialClosures.length > 0) {
      return form.partialClosures[form.partialClosures.length - 1].date;
    }
    return form.date;
  };

  // --- Динамический вопрос после закрытия ---
  const getDynamicCommentLabel = () => {
    // Для частичного закрытия считаем P/L по части
    if (form.closeType === 'Часть' && form.closePrice && form.closeLots) {
      const isLong = form.direction === 'Лонг';
      const pl = isLong
        ? (Number(form.closePrice) - Number(form.price)) * Number(form.closeLots)
        : (Number(form.price) - Number(form.closePrice)) * Number(form.closeLots);
      if (pl > 0) return 'Какой сетап использовали? Как вели сделку?';
      if (pl < 0) return 'Почему получился убыток? Какая ошибка? Какой сетап не сработал?';
    }
    // Для полного закрытия считаем по всей сделке
    if (form.closeType === 'Всю' && form.closePrice) {
      const isLong = form.direction === 'Лонг';
      const pl = isLong
        ? (Number(form.closePrice) - Number(form.price)) * Number(form.lots)
        : (Number(form.price) - Number(form.closePrice)) * Number(form.lots);
      if (pl > 0) return 'Какой сетап использовали? Как вели сделку?';
      if (pl < 0) return 'Почему получился убыток? Какая ошибка? Какой сетап не сработал?';
    }
    return 'Ваши комментарии к сделке';
  };

  // Получение курса ЦБ РФ
  const fetchUsdRate = async () => {
    try {
      const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
      const data = await res.json();
      setUsdRate(Number(data.Valute.USD.Value));
    } catch {
      setUsdRate(90);
    }
  };

  useEffect(() => {
    if (showForm) fetchUsdRate();
  }, [showForm]);

  const handleCurrencyToggle = () => {
    if (currency === 'RUB') {
      // RUB -> USD
      setForm((prev: any) => ({
        ...prev,
        price: prev.price ? (Number(prev.price) / usdRate).toFixed(2) : '',
        capital: prev.capital ? (Number(prev.capital) / usdRate).toFixed(2) : '',
      }));
      setCurrency('USD');
    } else {
      // USD -> RUB
      setForm((prev: any) => ({
        ...prev,
        price: prev.price ? (Number(prev.price) * usdRate).toFixed(2) : '',
        capital: prev.capital ? (Number(prev.capital) * usdRate).toFixed(2) : '',
      }));
      setCurrency('RUB');
    }
  };

  const renderStep = () => {
    const q = questions[step];
    if (!q) return null;
    // --- Направление: две кнопки ---
    if (q.key === 'direction') {
      return (
        <div style={{margin:'18px 0'}}>
          <div style={{fontWeight:700, fontSize:18, marginBottom:10}}>{q.label}</div>
          <button onClick={() => handleNext('Лонг')} style={{marginRight:16, padding:'10px 32px', borderRadius:8, border:'none', background:'#27ae60', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer'}}>Лонг</button>
          <button onClick={() => handleNext('Шорт')} style={{padding:'10px 32px', borderRadius:8, border:'none', background:'#e74c3c', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer'}}>Шорт</button>
        </div>
      );
    }
    // --- Цена за лот с тумблером ₽/$ ---
    if (q.key === 'price') {
      return (
        <form onSubmit={e => {
          e.preventDefault();
          let raw = priceInput.replace(',', '.').replace(/\s/g, '');
          let val = Number(raw);
          console.log('raw:', raw, 'val:', val, 'usdRate:', usdRate, 'priceCurrency:', priceCurrency);
          if (isNaN(val) || val <= 0) return alert('Цена должна быть больше 0');
          if (priceCurrency === 'USD') {
            if (!usdRate || isNaN(usdRate) || usdRate <= 0) {
              alert('Ошибка загрузки курса доллара. Попробуйте позже.');
              return;
            }
            val = val * usdRate;
            if (isNaN(val) || val <= 0) return alert('Цена должна быть больше 0');
          }
          setPriceInput('');
          handleNext(val);
        }} style={{margin:'18px 0'}}>
          <div style={{display:'flex', alignItems:'center', marginBottom:10}}>
            <span style={{fontWeight:700, fontSize:18, marginRight:16}}>{q.label}</span>
            <button type="button" onClick={()=>setPriceCurrency('RUB')} style={{padding:'6px 14px', borderRadius:8, border:'none', background:priceCurrency==='RUB'?'#4f8cff':'#222', color:'#fff', fontWeight:700, fontSize:15, marginRight:8, cursor:'pointer'}}>₽</button>
            <button type="button" onClick={() => {
              if (!usdRate || isNaN(usdRate) || usdRate <= 0) {
                alert('Ошибка загрузки курса доллара. Попробуйте позже.');
                return;
              }
              setPriceCurrency('USD');
            }} style={{padding:'6px 14px', borderRadius:8, border:'none', background:priceCurrency==='USD'?'#4f8cff':'#222', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer'}}>$</button>
            {priceCurrency==='USD' && <span style={{marginLeft:14, color:'#888', fontSize:14}}>Курс: 1$ = {usdRate}₽</span>}
          </div>
          <input
            type="text"
            step="0.01"
            required
            min={0.01}
            style={{padding:'10px 16px', borderRadius:8, border:'1.5px solid #888', fontSize:16, width:260, marginRight:12}}
            autoFocus
            placeholder={priceCurrency==='RUB'?'Цена в рублях':'Цена в $'}
            value={priceInput}
            onChange={e => setPriceInput(e.target.value)}
          />
          <button type="submit" style={{padding:'10px 22px', borderRadius:8, border:'none', background:'#27ae60', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer'}}>Далее</button>
        </form>
      );
    }
    // --- Капитал только в рублях ---
    if (q.key === 'capital') {
      return (
        <form onSubmit={e => {
          e.preventDefault();
          let raw = (e.target as any)[0].value.replace(',', '.').replace(/\s/g, '');
          let val = Number(raw);
          if (isNaN(val) || val <= 0) return alert('Капитал должен быть больше 0');
          handleNext(val);
        }} style={{margin:'18px 0'}}>
          <div style={{fontWeight:700, fontSize:18, marginBottom:10}}>{q.label} <span style={{color:'#888', fontSize:15}}>₽</span></div>
          <input type="text" step="0.01" required min={0.01} style={{padding:'10px 16px', borderRadius:8, border:'1.5px solid #888', fontSize:16, width:260, marginRight:12}} autoFocus placeholder="Капитал в рублях" />
          <button type="submit" style={{padding:'10px 22px', borderRadius:8, border:'none', background:'#27ae60', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer'}}>Далее</button>
        </form>
      );
    }
    // --- Остальные поля ---
    if (q.key === 'open') {
      return (
        <div style={{margin:'18px 0'}}>
          <div style={{fontWeight:700, fontSize:18, marginBottom:10}}>{q.label}</div>
          <button onClick={() => handleNext('Да')} style={{marginRight:16, padding:'10px 32px', borderRadius:8, border:'none', background:'#27ae60', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer'}}>Да</button>
          <button onClick={() => handleNext('Нет')} style={{padding:'10px 32px', borderRadius:8, border:'none', background:'#e74c3c', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer'}}>Нет</button>
        </div>
      );
    }
    if (q.key === 'closePrice') {
      return (
        <form onSubmit={e => {
          e.preventDefault();
          let raw = (e.currentTarget.elements[0] as HTMLInputElement).value.replace(',', '.').replace(/\s/g, '');
          let val = Number(raw);
          console.log('raw:', raw, 'val:', val, 'usdRate:', usdRate, 'priceCurrency:', priceCurrency);
          if (isNaN(val) || val <= 0) return alert('Цена должна быть больше 0');
          if (priceCurrency === 'USD') {
            if (!usdRate || isNaN(usdRate) || usdRate <= 0) {
              alert('Ошибка загрузки курса доллара. Попробуйте позже.');
              return;
            }
            val = val * usdRate;
            if (isNaN(val) || val <= 0) return alert('Цена должна быть больше 0');
          }
          handleNext(val);
        }} style={{margin:'18px 0'}}>
          <div style={{fontWeight:700, fontSize:18, marginBottom:10}}>{q.label} <span style={{color:'#888', fontSize:15}}>{priceCurrency === 'USD' ? '$' : '₽'}</span></div>
          <input type="text" step="0.01" required min={0.01} style={{padding:'10px 16px', borderRadius:8, border:'1.5px solid #888', fontSize:16, width:260, marginRight:12}} autoFocus placeholder={priceCurrency==='RUB'?'Цена в рублях':'Цена в $'} />
          <button type="submit" style={{padding:'10px 22px', borderRadius:8, border:'none', background:'#27ae60', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer'}}>Далее</button>
        </form>
      );
    }
    if (q.key === 'closeType') {
      return (
        <div style={{margin:'18px 0'}}>
          <div style={{fontWeight:700, fontSize:18, marginBottom:10}}>{q.label}</div>
          <button onClick={() => handleNext('Всю')} style={{marginRight:16, padding:'10px 32px', borderRadius:8, border:'none', background:'#27ae60', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer'}}>Всю</button>
          <button onClick={() => handleNext('Часть')} style={{padding:'10px 32px', borderRadius:8, border:'none', background:'#e74c3c', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer'}}>Часть</button>
        </div>
      );
    }
    return (
      <form onSubmit={e => { e.preventDefault(); handleNext((e.target as any)[0].value); }} style={{margin:'18px 0'}}>
        <div style={{fontWeight:700, fontSize:18, marginBottom:10}}>{q.key === 'comment' ? getDynamicCommentLabel() : q.label}</div>
        <input type={q.type} required style={{padding:'10px 16px', borderRadius:8, border:'1.5px solid #888', fontSize:16, width:260, marginRight:12}} autoFocus />
        <button type="submit" style={{padding:'10px 22px', borderRadius:8, border:'none', background:'#27ae60', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer'}}>Далее</button>
      </form>
    );
  };

  // Формулы для таблицы
  const calcPercent = (lots: any, price: any, capital: any) => {
    const sum = Number(lots) * Number(price);
    return capital ? ((sum / Number(capital)) * 100).toFixed(1) + '%' : '';
  };
  const calcProfit = (rec: any) => {
    if (rec.open === 'Да') return '-';
    const lots = Number(rec.lots);
    const isLong = rec.direction === 'Лонг';
    const openSum = lots * Number(rec.price);
    let closeSum = lots * Number(rec.closePrice || 0);
    if (rec.closeType === 'Часть' && rec.closeLots) {
      closeSum = Number(rec.closeLots) * Number(rec.closePrice || 0);
    }
    return isLong
      ? (closeSum - openSum).toFixed(2)
      : (openSum - closeSum).toFixed(2);
  };

  function getDealDuration(rec: any) {
    // Для частичных закрытий — до последнего partialClosure, иначе до closeDate
    let end = rec.closeDate;
    if (rec.partialClosures && rec.partialClosures.length > 0) {
      end = rec.partialClosures[rec.partialClosures.length-1].date;
    }
    if (!rec.date || !end) return null;
    const d1 = new Date(rec.date), d2 = new Date(end);
    const diff = (d2.getTime()-d1.getTime())/(1000*60*60*24);
    return diff >= 0 ? diff : null;
  }

  function getRowBorderColor(rec: any) {
    const dur = getDealDuration(rec);
    if (dur === null) return 'none';
    if (dur <= 2) return '#27ae60'; // зелёная
    if (dur <= 7) return '#ffd600'; // жёлтая
    return '#e74c3c'; // красная
  }

  function sortRecords(recs: any[]) {
    const arr = [...recs];
    if (sortType === 'duration') {
      arr.sort((a, b) => {
        const da = getDealDuration(a) ?? 9999;
        const db = getDealDuration(b) ?? 9999;
        return da - db;
      });
    } else if (sortType === 'profit') {
      arr.sort((a, b) => Number(calcProfit(b)) - Number(calcProfit(a)));
    } else if (sortType === 'date') {
      arr.sort((a, b) => {
        const da = new Date(b.closeDate || 0).getTime();
        const db = new Date(a.closeDate || 0).getTime();
        return da - db;
      });
    } else if (sortType === 'cost') {
      arr.sort((a, b) => (Number(b.lots)*Number(b.price)) - (Number(a.lots)*Number(a.price)));
    }
    return arr;
  }

  // Вставляю обратно функции статистики:
  function getBestDay(recs: any[]) {
    if (!recs.length) return '-';
    const days = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
    const plByDay = Array(7).fill(0);
    recs.forEach((r: any) => {
      // Основное закрытие
      if (r.closeDate && r.closePrice && r.open !== 'Да') {
        const d = new Date(r.closeDate).getDay();
        plByDay[d] += Number(calcProfit(r));
      }
      // Частичные закрытия
      if (r.partialClosures && Array.isArray(r.partialClosures)) {
        r.partialClosures.forEach((c: any) => {
          if (c.date && c.price && r.date && r.price && r.lots) {
            const d = new Date(c.date).getDay();
            const isLong = r.direction === 'Лонг';
            const pl = isLong
              ? (Number(c.price) - Number(r.price)) * Number(c.lots)
              : (Number(r.price) - Number(c.price)) * Number(c.lots);
            plByDay[d] += pl;
          }
        });
      }
    });
    const max = Math.max(...plByDay);
    return max === 0 ? '-' : days[plByDay.indexOf(max)];
  }
  function getWorstDay(recs: any[]) {
    if (!recs.length) return '-';
    const days = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
    const plByDay = Array(7).fill(0);
    recs.forEach((r: any) => {
      if (r.closeDate && r.closePrice && r.open !== 'Да') {
        const d = new Date(r.closeDate).getDay();
        plByDay[d] += Number(calcProfit(r));
      }
      if (r.partialClosures && Array.isArray(r.partialClosures)) {
        r.partialClosures.forEach((c: any) => {
          if (c.date && c.price && r.date && r.price && r.lots) {
            const d = new Date(c.date).getDay();
            const isLong = r.direction === 'Лонг';
            const pl = isLong
              ? (Number(c.price) - Number(r.price)) * Number(c.lots)
              : (Number(r.price) - Number(c.price)) * Number(c.lots);
            plByDay[d] += pl;
          }
        });
      }
    });
    const min = Math.min(...plByDay);
    return min === 0 ? '-' : days[plByDay.indexOf(min)];
  }
  function getFavTicker(recs: any[]) {
    if (!recs.length) return '-';
    const freq: Record<string, number> = {};
    recs.forEach((r: any) => { freq[r.ticker] = (freq[r.ticker]||0)+1; });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return sorted.length ? sorted[0][0] : '-';
  }
  function getAvgPosition(recs: any[]) {
    if (!recs.length) return '-';
    const avg = recs.reduce((sum: number, r: any) => sum+Number(r.lots)*Number(r.price),0)/recs.length;
    return avg ? avg.toFixed(2) : '-';
  }
  function getAvgDuration(recs: any[]) {
    if (!recs.length) return '-';
    let total = 0, count = 0;
    recs.forEach((r: any) => {
      // Основное закрытие
      if (r.date && r.closeDate && r.open !== 'Да') {
        const d1 = new Date(r.date), d2 = new Date(r.closeDate);
        const diff = (d2.getTime()-d1.getTime())/(1000*60*60*24);
        if (diff >= 0) { total += diff; count++; }
      }
      // Частичные закрытия
      if (r.partialClosures && Array.isArray(r.partialClosures)) {
        r.partialClosures.forEach((c: any) => {
          if (r.date && c.date) {
            const d1 = new Date(r.date), d2 = new Date(c.date);
            const diff = (d2.getTime()-d1.getTime())/(1000*60*60*24);
            if (diff >= 0) { total += diff; count++; }
          }
        });
      }
    });
    return count ? (total/count).toFixed(1)+' дн.' : '-';
  }
  function getMaxLoss(recs: any[]) {
    if (!recs.length) return '-';
    const min = Math.min(...recs.map((r: any)=>Number(calcProfit(r))));
    return min < 0 ? min.toFixed(2) : '-';
  }
  function getMaxProfit(recs: any[]) {
    if (!recs.length) return '-';
    const max = Math.max(...recs.map((r: any)=>Number(calcProfit(r))));
    return max > 0 ? max.toFixed(2) : '-';
  }

  // --- Импорт/Экспорт ---
  const handleExport = () => {
    if (!login) return;
    const data = localStorage.getItem('journal_' + login) || '[]';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal_${login}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
    reader.onload = (ev) => {
      try {
              const text = ev.target?.result as string;
        const arr = JSON.parse(text);
        if (!Array.isArray(arr)) throw new Error('Неверный формат файла');
        setRecords(arr);
        if (login) localStorage.setItem('journal_' + login, JSON.stringify(arr));
        alert('Импорт успешно завершён!');
      } catch (err) {
        alert('Ошибка импорта: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    // сбрасываем value, чтобы можно было выбрать тот же файл повторно
    e.target.value = '';
  };

  useEffect(() => {
    if (openCommentIndex === null) return;
    const close = (e: MouseEvent) => {
      // если клик вне тултипа и вне иконки
      const tooltip = document.getElementById('comment-tooltip');
      if (tooltip && !tooltip.contains(e.target as Node)) {
        setOpenCommentIndex(null);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [openCommentIndex]);

  // --- Колонки для журнала ---
  const journalColumns: {key: string, label: React.ReactNode, width: number}[] = [
    { key: 'ticker', label: 'Тикер', width: 90 },
    { key: 'lots', label: 'Кол-во лотов', width: 60 },
    { key: 'price', label: 'Цена за лот', width: 90 },
    { key: 'direction', label: (<span>Лонг<br/>Шорт</span>), width: 70 },
    { key: 'capital', label: '% от капитала', width: 90 },
    { key: 'closePrice', label: 'Средняя цена закрытия', width: 110 },
    { key: 'closeLots', label: '% закрытия', width: 90 },
    { key: 'pl', label: 'P/L, ₽', width: 90 },
    { key: 'comment', label: 'Комментарии', width: 130 },
    { key: 'actions', label: 'Удалить', width: 60 },
  ];

    return (
    <LayoutWithSidePanel>
      <div style={{maxWidth:900, margin:'40px auto', background:'#232a3a', borderRadius:16, padding:36, color:'#fff', boxShadow:'0 8px 40px #0004', position:'relative'}}>
        {/* --- Надпись и кнопки в одной строке --- */}
        <div
              style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            background: '#1a1f2e',
            borderRadius: 10,
            padding: '14px 24px',
            marginBottom: 24,
          }}
        >
          <div style={{fontSize:16, color:'#bbb', fontWeight:600, textAlign:'left', flex:1, minWidth:220}}>
            Все данные журнала хранятся <b>только локально</b> на вашем устройстве. Для переноса на другой ПК или телефон используйте кнопки <b>Экспорт</b> и <b>Импорт</b> справа. После перезагрузки устройства или браузера все сделки сохраняются автоматически.
          </div>
          <div style={{display:'flex', gap:12, flexShrink:0}}>
            <button onClick={handleExport} style={{background:'#4f8cff', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:700, fontSize:16, cursor:'pointer', boxShadow:'0 2px 8px #0002'}}>
              Экспорт
            </button>
            <button onClick={handleImportClick} style={{background:'#27ae60', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:700, fontSize:16, cursor:'pointer', boxShadow:'0 2px 8px #0002'}}>
              Импорт
            </button>
            <input
              type="file"
              accept="application/json"
              ref={fileInputRef}
              onChange={handleImport}
              style={{ display: 'none' }}
            />
        </div>
                  </div>
        <h2 style={{fontWeight:800, fontSize:28, marginBottom:24}}>Дневник сделок</h2>
        <button onClick={()=>{setShowForm(true);resetForm();}} style={{background:'#4f8cff', color:'#fff', border:'none', borderRadius:8, padding:'12px 28px', fontWeight:800, fontSize:18, marginBottom:24, cursor:'pointer'}}>Добавить сделку</button>
        {showForm && (
          <div style={{background:'#1a1f2e', borderRadius:12, padding:24, marginBottom:24}}>
            {renderStep()}
                                    </div>
                                  )}
        <div style={{marginBottom:18, display:'flex', alignItems:'center', gap:16}}>
          <span style={{color:'#888', fontSize:15}}>Сортировка:</span>
          <select value={sortType} onChange={e=>setSortType(e.target.value as any)} style={{padding:'8px 14px', borderRadius:8, border:'1.5px solid #888', fontSize:15}}>
            <option value="date">По дате закрытия</option>
            <option value="duration">По длительности (цвету)</option>
            <option value="profit">По прибыльности</option>
            <option value="cost">По стоимости позиции</option>
                  </select>
                                      </div>
        <div style={{display:'flex', flexWrap:'wrap', gap:24, marginBottom:32, justifyContent:'center'}}>
          {/* Самый прибыльный и убыточный день недели */}
          <div style={{background:'#1a1f2e', borderRadius:10, padding:'18px 28px', minWidth:200, textAlign:'center'}}>
            <div style={{color:'#888', fontSize:14, marginBottom:6}}>Самый прибыльный день</div>
            <div style={{fontWeight:800, fontSize:20}}>{getBestDay(records)}</div>
                                    </div>
          <div style={{background:'#1a1f2e', borderRadius:10, padding:'18px 28px', minWidth:200, textAlign:'center'}}>
            <div style={{color:'#888', fontSize:14, marginBottom:6}}>Самый убыточный день</div>
            <div style={{fontWeight:800, fontSize:20}}>{getWorstDay(records)}</div>
                                      </div>
          {/* Самый любимый актив */}
          <div style={{background:'#1a1f2e', borderRadius:10, padding:'18px 28px', minWidth:200, textAlign:'center'}}>
            <div style={{color:'#888', fontSize:14, marginBottom:6}}>Самый любимый актив</div>
            <div style={{fontWeight:800, fontSize:20}}>{getFavTicker(records)}</div>
                                    </div>
          {/* Средний размер позиции */}
          <div style={{background:'#1a1f2e', borderRadius:10, padding:'18px 28px', minWidth:200, textAlign:'center'}}>
            <div style={{color:'#888', fontSize:14, marginBottom:6}}>Средний размер позиции</div>
            <div style={{fontWeight:800, fontSize:20}}>{getAvgPosition(records)}</div>
                                      </div>
          {/* Средняя длина сделки */}
          <div style={{background:'#1a1f2e', borderRadius:10, padding:'18px 28px', minWidth:200, textAlign:'center'}}>
            <div style={{color:'#888', fontSize:14, marginBottom:6}}>Средняя длина сделки</div>
            <div style={{fontWeight:800, fontSize:20}}>{getAvgDuration(records)}</div>
                                    </div>
          {/* Самый большой убыток */}
          <div style={{background:'#1a1f2e', borderRadius:10, padding:'18px 28px', minWidth:200, textAlign:'center'}}>
            <div style={{color:'#888', fontSize:14, marginBottom:6}}>Самый большой убыток</div>
            <div style={{fontWeight:800, fontSize:20, color:'#e74c3c'}}>{getMaxLoss(records)}</div>
                                      </div>
          {/* Самая большая прибыль */}
          <div style={{background:'#1a1f2e', borderRadius:10, padding:'18px 28px', minWidth:200, textAlign:'center'}}>
            <div style={{color:'#888', fontSize:14, marginBottom:6}}>Самая большая прибыль</div>
            <div style={{fontWeight:800, fontSize:20, color:'#27ae60'}}>{getMaxProfit(records)}</div>
                                    </div>
                                      </div>
        {/* --- Крышка-шапка таблицы --- */}
        <div style={{
          display:'flex',
          fontWeight:700,
          fontSize:15,
          color:'#fff',
          marginBottom:0,
          marginTop:24,
          alignItems:'center',
          background:'#1a1f2e',
          borderBottom:'3px solid #333',
          boxSizing:'border-box',
          padding:'0',
          borderRadius:0,
        }}>
          {journalColumns.map((col, idx) => (
            <div
              key={col.key}
              style={{
                minWidth:col.width,
                flexBasis:col.width,
                maxWidth:col.width,
                padding: col.key === 'comment' ? '10px 0 10px 18px' : '10px 0 10px 12px',
                textAlign: col.key==='actions' ? 'center' as const : 'left' as const,
                borderRight: idx === journalColumns.length-1 ? 'none' : '2px solid #333',
                boxSizing: 'border-box' as const,
                letterSpacing:0.1,
              }}
            >
              {col.label}
                                    </div>
                                  ))}
                                      </div>
        {/* --- Список карточек сделок --- */}
                                    <div>
          {sortRecords(records).map((rec, i, arr) => {
            const closedLots = (rec.partialClosures||[]).reduce((sum: any, c: any) => sum + Number(c.lots), 0);
            const isFullyClosed = closedLots >= Number(rec.lots);
                    return (
              <div key={i} style={{display:'flex', alignItems:'stretch', width:'100%', boxSizing:'border-box', marginBottom: i !== arr.length-1 ? 8 : 0}}>
                {/* Цветной индикатор слева вне рамки */}
                <div style={{width:6, borderRadius:'12px 0 0 12px', background:getRowBorderColor(rec), flexShrink:0}} />
                {/* Карточка с рамкой */}
                <div style={{
                  display: 'flex',
                  flex: 1,
                  alignItems: 'stretch',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderTop: `2.5px solid ${getRowBorderColor(rec)}`,
                  borderRight: `2.5px solid ${getRowBorderColor(rec)}`,
                  borderBottom: `2.5px solid ${getRowBorderColor(rec)}`,
                  borderLeft: 'none',
                  borderRadius: '0 12px 12px 0',
                  background: '#232a3a',
                }}>
                  {journalColumns.map((col, idx) => {
                    const baseStyle = {
                      padding: col.key==='actions' ? '8px 0' : '8px 0 8px 8px',
                      minWidth:col.width,
                      flexBasis:col.width,
                      maxWidth:col.width,
                      textAlign: col.key==='actions' ? 'center' as const : 'left' as const,
                      borderRight: idx === journalColumns.length-1 ? 'none' : '2px solid #333',
                      boxSizing: 'border-box' as const,
                    };
                    if (col.key === 'ticker') return <div key={col.key} style={baseStyle}>{rec.ticker}</div>;
                    if (col.key === 'lots') return <div key={col.key} style={baseStyle}>{rec.lots}</div>;
                    if (col.key === 'price') return <div key={col.key} style={baseStyle}>{rec.price !== undefined ? Number(rec.price).toFixed(2) : ''}</div>;
                    if (col.key === 'direction') return <div key={col.key} style={baseStyle}>{rec.direction}</div>;
                    if (col.key === 'capital') return <div key={col.key} style={baseStyle}>{calcPercent(rec.lots, rec.price, rec.capital)}</div>;
                    if (col.key === 'closePrice') return <div key={col.key} style={baseStyle}>{rec.closePrice !== undefined && rec.closePrice !== '' ? Number(rec.closePrice).toFixed(2) : '-'}</div>;
                    if (col.key === 'closeLots') return <div key={col.key} style={baseStyle}>{rec.closeType === 'Часть' && rec.closeLots
                      ? ((Number(rec.closeLots)/Number(rec.lots)*100).toFixed(1)+'%')
                      : (rec.closeType === 'Всю' ? '100%' : (rec.open === 'Да' ? <button onClick={()=>handleEditRecord(i)} style={{background:'#4f8cff',color:'#fff',border:'none',borderRadius:6,padding:'4px 10px',fontWeight:700,cursor:'pointer',fontSize:13}}>Дополнить</button> : ''))}</div>;
                    if (col.key === 'pl') return <div key={col.key} style={{
                      ...baseStyle,
                      color: Number(calcProfit(rec)) > 0 ? '#27ae60' : (Number(calcProfit(rec)) < 0 ? '#e74c3c' : '#fff'),
                      fontWeight:700,
                      position:'relative',
                    }}>{rec.open === 'Да' && !rec.closePrice
                      ? <button onClick={()=>handleEditRecord(i)} style={{background:'#4f8cff',color:'#fff',border:'none',borderRadius:6,padding:'4px 10px',fontWeight:700,cursor:'pointer',fontSize:13}}>Дополнить</button>
                      : <span style={{cursor:'pointer'}} title={
                        rec.open === 'Да'
                          ? ''
                          : `P/L: ${Number(calcProfit(rec)).toFixed(2)}₽\n% от капитала: ${rec.capital ? ((Number(calcProfit(rec))/rec.capital)*100).toFixed(2)+'%' : '-'}\n% по сделке: ` +
                            (rec.price && rec.closePrice
                              ? (rec.direction === 'Лонг'
                                  ? (((rec.closePrice-rec.price)/rec.price)*100).toFixed(2)+'%'
                                  : (((rec.price-rec.closePrice)/rec.price)*100).toFixed(2)+'%')
                              : '-')
                      }>{Number(calcProfit(rec)).toFixed(2)}</span>}
                    </div>;
                    if (col.key === 'comment') return (
                      <div key={col.key} style={{
                        ...baseStyle,
                        position: 'relative',
                        fontSize:15,
                        display:'flex', alignItems:'center', gap:8, minWidth:0
                      }}>
                        {rec.comment ? (
                          <button
                            style={{
                              background:'none',
                              border:'none',
                              cursor:'pointer',
                              padding:0,
                              margin:0,
                              fontSize:22,
                              color:'#4f8cff',
                              display:'flex',
                              alignItems:'center',
                              lineHeight:1,
                              marginLeft:0,
                              transition:'color 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#27ae60')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#4f8cff')}
                            onClick={e => {
                              e.stopPropagation();
                              setOpenCommentIndex(openCommentIndex === i ? null : i);
                            }}
                            title="Показать полный комментарий"
                          >
                            <svg width="22" height="22" viewBox="0 0 22 22" style={{display:'block'}}><path d="M6 9l5 5 5-5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round"/></svg>
                          </button>
                        ) : (
                          rec.open === 'Да' ? <button onClick={()=>handleEditRecord(i)} style={{background:'#4f8cff',color:'#fff',border:'none',borderRadius:6,padding:'4px 10px',fontWeight:700,cursor:'pointer',fontSize:13}}>Дополнить</button> : ''
                        )}
                        {openCommentIndex === i && (
                          <div id="comment-tooltip" style={{
                            position: 'absolute',
                            left: 0,
                            top: 36,
                            zIndex: 99999,
                            background: '#232a3a',
                            color: '#fff',
                            padding: '14px 20px',
                            borderRadius: '10px',
                            boxShadow: '0 4px 24px #0008',
                            whiteSpace: 'pre-line',
                            fontSize: '15px',
                            maxWidth: '340px',
                            minWidth: '120px',
                            pointerEvents: 'auto',
                          }}>
                            <div style={{position:'absolute', top:-10, left:16, width:0, height:0, borderLeft:'8px solid transparent', borderRight:'8px solid transparent', borderBottom:'10px solid #232a3a'}} />
                            {rec.comment}
                          </div>
                        )}
                                      </div>
                                    );
                    if (col.key === 'actions') return (
                      <div key={col.key} style={{padding:'8px 0', minWidth:col.width, flexBasis:col.width, maxWidth:col.width, textAlign:'center'}}>
                        <button onClick={() => handleDeleteRecord(i)} style={{background:'none', border:'none', color:'#e74c3c', fontSize:22, cursor:'pointer', lineHeight:1, padding:0, margin:0}} title="Удалить">×</button>
                      </div>
                    );
                     return null;
                   })}
                            </div>
                      </div>
                    );
          })}
                            </div>
        <div style={{textAlign:'center', color:'#888', fontSize:13, marginTop:32, marginBottom:8}}>
          Только ручное добавление сделок улучшает торговлю
                          </div>
                            </div>
    </LayoutWithSidePanel>
  );
};

const App: React.FC = () => {
  const [yScales, setYScales] = useState<Record<string, YScale>>({});
  const [sort, setSort] = useState<string>('');
  const [showSortModal, setShowSortModal] = useState(true);
  const [tickerChanges, setTickerChanges] = useState<Record<string, number>>({});
  const [sortKey, setSortKey] = useState(0); // Ключ для принудительного обновления
  const [timeFrame, setTimeFrame] = useState<string>('day');
  const [candlesCount, setCandlesCount] = useState<number>(180);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data, loading, error } = useData({ timeFrame, candlesCount });
  const {
    isAnalyzing,
    analyzeProgress,
    currentTicker,
    analyzeResults,
    analysisModal,
    runAnalysis,
    runAllAnalysis,
    openAnalysisModal,
    closeAnalysisModal
  } = useAnalysis();

  const location = useLocation();

  // Вычисляем процентные изменения для всех тикеров
  useEffect(() => {
    const changes: Record<string, number> = {};
    
    ALL_TICKERS.forEach(ticker => {
      const candles = data[ticker];
      if (candles && candles.length > 0) {
        const lastCandle = candles[candles.length - 1];
        const changePercent = ((lastCandle.close - lastCandle.open) / lastCandle.open) * 100;
        changes[ticker] = changePercent;
      }
    });
    
    setTickerChanges(changes);
  }, [data]);

  // Обработчик изменения сортировки
  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
    setSortKey(prev => prev + 1); // Принудительно обновляем блок тикеров
    localStorage.setItem('moex_sort', newSort);
  }, []);

  // Обработчик выбора сортировки в модальном окне
  const handleSortSelect = useCallback((selectedSort: string) => {
    setSort(selectedSort);
    setShowSortModal(false);
    setSortKey(prev => prev + 1); // Принудительно обновляем блок тикеров
    localStorage.setItem('moex_sort', selectedSort);
  }, []);

  // Обработчик смены таймфрейма
  const handleTimeFrameChange = useCallback((tf: string) => {
    setTimeFrame(tf);
    setCandlesCount(180); // сбрасываем на дефолт при смене таймфрейма
  }, []);

  // Обработчик смены числа свечей
  const handleCandlesCountChange = useCallback((count: number) => {
    setCandlesCount(count);
  }, []);

  // Сортировка тикеров
  const sortedTickers = useMemo(() => {
    const tickers = ALL_TICKERS.filter(ticker => data[ticker]?.length);
    
    // Если данные еще не загружены или tickerChanges пустой, возвращаем пустой массив
    if (Object.keys(tickerChanges).length === 0) {
      return [];
    }
    
    if (sort === 'alpha') {
      return [...tickers].sort();
    }
    
    if (sort === 'random') {
      return [...tickers].sort(() => Math.random() - 0.5);
    }
    
    return [...tickers].sort((a, b) => {
      const changeA = tickerChanges[a] || 0;
      const changeB = tickerChanges[b] || 0;
      
      if (sort === 'growth') return changeB - changeA;
      if (sort === 'fall') return changeA - changeB;
      return 0;
    });
  }, [data, sort, tickerChanges]);

  // Проверяем готовность данных для отображения
  const isDataReady = Object.keys(tickerChanges).length > 0 && Object.keys(data).length > 0;

  // Обработчики событий
  const handleLoginClick = () => {
    alert('Войти (заглушка)');
  };
  const handleRegisterClick = () => {
    alert('Зарегистрироваться (заглушка)');
  };

  const handleYScaleChange = (ticker: string, field: 'min' | 'max', value: string) => {
    setYScales(prev => ({
      ...prev,
      [ticker]: {
        ...prev[ticker],
        [field]: value
      }
    }));
  };

  const handleYScaleReset = (ticker: string) => {
    setYScales(prev => ({ ...prev, [ticker]: { min: '', max: '' } }));
  };

  const handleAnalysisRequest = async (setup: string, csvData?: Record<string, Candle[]>) => {
    openAnalysisModal(setup);
    const analysisData = csvData || data;
    await runAnalysis(setup, analysisData);
  };

  const handleAllAnalysisRequest = async (csvData?: Record<string, Candle[]>, csvTicker?: string) => {
    openAnalysisModal('CSV_' + (csvTicker || 'all'));
    const analysisData = csvData || data;
    await runAllAnalysis(analysisData, csvTicker);
  };

  const navigate = useNavigate();
  const handleSearchClick = useCallback(() => {
    navigate('/search');
  }, [navigate]);

  if (loading) {
                    return (
      <div style={{
        minHeight: '100vh', 
        background: 'var(--color-bg)', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center' 
      }}>
        <Loader text="Загрузка тикеров MOEX..." />
                      </div>
                    );
  }
  
  if (error) {
                    return (
        <div style={{
        minHeight: '100vh', 
        background: 'var(--color-bg)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--color-danger)',
        fontSize: '18px'
      }}>
        Ошибка: {error}
                      </div>
                    );
  }

  // Модальное окно выбора сортировки
  if (showSortModal && location.pathname === '/') {
                    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'var(--color-bg-secondary)',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center'
        }}>
          <h2 style={{
            margin: '0 0 24px 0',
            color: 'var(--color-text)',
            fontSize: '24px',
            fontWeight: 700
          }}>
            Выберите сортировку тикеров
          </h2>
          <p style={{
            margin: '0 0 24px 0',
            color: 'var(--color-text-secondary)',
            fontSize: '16px',
            lineHeight: 1.5
          }}>
            Как вы хотите отсортировать тикеры MOEX?
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {SORT_OPTIONS.map(option => (
          <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
            style={{
                  padding: '16px 20px',
                  background: 'var(--color-bg)',
                  border: '2px solid var(--color-border)',
                  borderRadius: '12px',
                  color: 'var(--color-text)',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-primary)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }}
              >
                {option.label}
          </button>
                        ))}
                      </div>
            </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <LayoutWithSidePanel>
          <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
            <Controls
              candlesCount={candlesCount}
              onCandlesCountChange={handleCandlesCountChange}
              sort={sort}
              onSortChange={handleSortChange}
              timeFrame={timeFrame}
              onTimeFrameChange={handleTimeFrameChange}
              onLoginClick={handleLoginClick}
              onRegisterClick={handleRegisterClick}
              onSearchClick={handleSearchClick}
            />

            <div 
              key={`tickers-${sort}-${sortKey}`} 
              style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}
            >
              {!isDataReady && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  color: 'var(--color-text-secondary)',
                  fontSize: '16px'
                }}>
                  <Loader text="Подготовка данных для сортировки..." />
      </div>
              )}
              
              {isDataReady && sortedTickers.map(ticker => {
        const candles = data[ticker];
                if (!candles || candles.length === 0) return null;

        return (
                  <div key={ticker} style={{ marginBottom: 48 }}>
                    <StockChart
                      candles={candles}
                      ticker={ticker}
                      yScale={yScales[ticker]}
                      onYScaleChange={(field, value) => handleYScaleChange(ticker, field, value)}
                      onYScaleReset={() => handleYScaleReset(ticker)}
                      showSMA={true}
                    />
          </div>
        );
      })}
                    </div>

            <AnalysisModal
              isOpen={!!analysisModal}
              onClose={closeAnalysisModal}
              setupName={analysisModal || ''}
              results={analyzeResults}
              isAnalyzing={isAnalyzing}
              analyzeProgress={analyzeProgress}
              currentTicker={currentTicker}
            />
        </div>
        </LayoutWithSidePanel>
      } />
      <Route path="/profile" element={<LayoutWithSidePanel><ProfilePage /></LayoutWithSidePanel>} />
      <Route path="/up" element={<LayoutWithSidePanel><UpgradePage /></LayoutWithSidePanel>} />
      <Route path="/journal" element={<LayoutWithSidePanel><JournalPage /></LayoutWithSidePanel>} />
      <Route path="/search" element={<LayoutWithSidePanel><SearchSetupsPage /></LayoutWithSidePanel>} />
    </Routes>
  );
};

// --- Компонент смены пароля ---
const ChangePasswordForm: React.FC<{ onSave: (newPassword: string) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [password, setPassword] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [error, setError] = React.useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !password2) return setError('Введите новый пароль дважды');
    if (password !== password2) return setError('Пароли не совпадают');
    onSave(password);
  };
  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16,minWidth:260}}>
      <h3 style={{margin:0}}>Смена пароля</h3>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Новый пароль" style={{padding:10,borderRadius:8,border:'1.5px solid #ccc',fontSize:16}} />
      <input type="password" value={password2} onChange={e=>setPassword2(e.target.value)} placeholder="Повторите пароль" style={{padding:10,borderRadius:8,border:'1.5px solid #ccc',fontSize:16}} />
      {error && <div style={{color:'#e74c3c',fontSize:15}}>{error}</div>}
      <div style={{display:'flex',gap:12,marginTop:8}}>
        <button type="submit" style={{background:'#27ae60',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:700,fontSize:16}}>Сохранить</button>
        <button type="button" onClick={onCancel} style={{background:'#888',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:700,fontSize:16}}>Отмена</button>
      </div>
    </form>
  );
};

export default App; 