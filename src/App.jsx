import React, { useState, useEffect } from 'react';
import CustomerPanel from './apps/customer/CustomerPanel';
import AdminPanel from './apps/admin/AdminPanel';
import Login from './apps/auth/Login';
import { useData } from './shared/hooks/useData';
import { LogOut } from 'lucide-react';

function App() {
  const { 
    data, 
    user,
    setUser,
    logout,
    updateMaterials, 
    addMaterial,
    removeMaterial,
    updateParameters, 
    updateSection, 
    updateField, 
    resetData, 
    reorderSections,
    manualSave,
    addItem,
    removeItem,
    updateItemForm,
    updateLetterTypes,
    addLetterType,
    removeLetterType,
    updateCompanyInfo
  } = useData();
  
  const [updateStatus, setUpdateStatus] = useState(''); // '', 'checking', 'available', 'not-available', 'downloaded', 'error'
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.receive('update_available', (version) => {
        setUpdateStatus('available');
        setIsUpdating(true);
        alert(`Yeni sürüm bulundu (${version})! Güncelleme otomatik olarak indiriliyor...`);
      });

      window.electronAPI.receive('update_not_available', () => {
        setUpdateStatus('not-available');
        setIsUpdating(false);
        alert("Zaten son sürümü kullanıyorsunuz.");
      });

      window.electronAPI.receive('update_downloaded', () => {
        setUpdateStatus('downloaded');
        setIsUpdating(false);
        if (confirm("Güncelleme indirildi. Uygulamanın güncellenmesi için şimdi yeniden başlatılsın mı?")) {
          window.electronAPI.send('restart_app');
        }
      });

      window.electronAPI.receive('update_error', (message) => {
        setUpdateStatus('error');
        setIsUpdating(false);
        alert(`Güncelleme hatası: ${message}`);
      });
    }
  }, []);

  const handleUpdateCheck = async () => {
    if (window.electronAPI) {
      setUpdateStatus('checking');
      setIsUpdating(true);
      try {
        await window.electronAPI.invoke('check-for-updates');
      } catch (err) {
        setUpdateStatus('error');
        setIsUpdating(false);
        alert("Güncelleme kontrolü sırasında bir hata oluştu.");
      }
    } else {
      alert("Güncelleme sistemi sadece paketlenmiş uygulamada çalışır.");
    }
  };

  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('reklamcu_mode') === 'admin';
  });

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.startsWith('admin.')) {
      const newUrl = window.location.href.replace('admin.', '');
      sessionStorage.setItem('reklamcu_mode', 'admin');
      window.location.href = newUrl;
    }
  }, []);

  if (!user) {
    return <Login onLoginSuccess={(u, t) => setUser(u)} />;
  }

  const togglePanel = () => {
    const newMode = !isAdmin;
    setIsAdmin(newMode);
    sessionStorage.setItem('reklamcu_mode', newMode ? 'admin' : 'customer');
  };

  return (
    <div className="app-container">
      {/* HEADER BAR */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '40px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 10000, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '11px', fontWeight: '900', color: '#f97316', letterSpacing: '1px' }}>SIENTO CREATIVE</div>
          <div style={{ height: '12px', width: '1px', background: '#334155' }} />
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>HOŞ GELDİN, <span style={{ color: 'white', fontWeight: '800' }}>{user.username?.toUpperCase()}</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={handleUpdateCheck}
            disabled={isUpdating}
            style={{ 
              backgroundColor: '#f97316', 
              color: 'white', 
              border: 'none', 
              padding: '4px 12px', 
              borderRadius: '6px', 
              fontSize: '10px', 
              fontWeight: '900', 
              cursor: isUpdating ? 'default' : 'pointer',
              boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isUpdating ? 0.7 : 1
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white', animation: 'pulse 1.5s infinite' }} />
            {updateStatus === 'checking' ? 'KONTROL EDİLİYOR...' : 
             updateStatus === 'available' ? 'GÜNCELLEME İNDİRİLİYOR...' : 
             'SON SÜRÜMÜ GÜNCELLE'}
          </button>
          <div style={{ textAlign: 'right', lineHeight: '1.1' }}>
            <div style={{ fontSize: '9px', fontWeight: '900', color: '#f97316' }}>V40 {data.appTag || 'AETHER'}</div>
            <div style={{ fontSize: '8px', color: '#64748b' }}>Version 3.0.0.1</div>
          </div>

          <button 
            onClick={logout}
            style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '10px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <LogOut size={12} /> ÇIKIŞ YAP
          </button>
        </div>
      </div>

      <div style={{ paddingTop: '40px' }}>
        <button 
          onClick={togglePanel}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 24px',
            borderRadius: '50px',
            backgroundColor: isAdmin ? '#1e293b' : '#f97316',
            color: 'white',
            fontWeight: '900',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            transition: '0.3s'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
          {isAdmin ? 'Müşteri Paneline Geç' : 'Yönetici Paneline Geç'}
        </button>

        {isAdmin ? (
          <AdminPanel 
            data={data} 
            updateMaterials={updateMaterials} 
            addMaterial={addMaterial}
            removeMaterial={removeMaterial}
            updateParameters={updateParameters} 
            updateSection={updateSection}
            updateField={updateField}
            resetData={resetData}
            reorderSections={reorderSections}
            manualSave={manualSave}
            updateLetterTypes={updateLetterTypes}
            addLetterType={addLetterType}
            removeLetterType={removeLetterType}
            updateCompanyInfo={updateCompanyInfo}
          />
        ) : (
          <CustomerPanel 
            data={data} 
            updateSection={updateSection}
            addItem={addItem}
            removeItem={removeItem}
            updateItemForm={updateItemForm}
          />
        )}
      </div>
    </div>
  );
}

export default App;
