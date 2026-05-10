import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  
  const inputStyle = {
    width: '100%',
    padding: '14px 14px 14px 45px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    transition: '0.3s'
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // New Registration Fields
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [slogan, setSlogan] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister && password !== confirmPassword) {
      setError('Şifreler uyuşmuyor');
      return;
    }
    
    setLoading(true);
    setError('');

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    let baseUrl = 'http://localhost:5000';
    
    if (window.electronAPI && window.electronAPI.getApiUrl) {
      const url = await window.electronAPI.getApiUrl();
      if (url) baseUrl = url;
    }

    const payload = isRegister ? {
      username, password, companyName, email, slogan, website, logo
    } : {
      username, password
    };

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bir hata oluştu');
      }

      if (isRegister) {
        setIsRegister(false);
        setError('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        // Reset fields
        setConfirmPassword('');
        setCompanyName('');
        setEmail('');
        setSlogan('');
        setWebsite('');
        setLogo(null);
      } else {
        localStorage.setItem('reklamcu_token', data.token);
        localStorage.setItem('reklamcu_user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: isRegister ? '500px' : '400px',
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '40px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          transition: 'max-width 0.3s ease'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: '#f97316', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)'
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '900', marginBottom: '10px' }}>
            {isRegister ? 'Yeni Hesap Oluştur' : 'Sisteme Giriş Yap'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Siento Creative Profesyonel Teklif Sistemi
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="password" 
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {isRegister && (
              <>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    type="password" 
                    placeholder="Şifre Tekrar"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />

                <input type="text" placeholder="Firma Adı" value={companyName} onChange={e => setCompanyName(e.target.value)} required style={inputStyle} />
                <input type="email" placeholder="E-posta Adresi" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                <input type="text" placeholder="Slogan" value={slogan} onChange={e => setSlogan(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Websitesi" value={website} onChange={e => setWebsite(e.target.value)} style={inputStyle} />
                
                <div style={{ marginTop: '5px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: '800' }}>FİRMA LOGOSU (.PNG / .JPG)</label>
                  <input type="file" accept="image/*" onChange={handleLogoChange} style={{ fontSize: '12px', color: '#94a3b8' }} />
                  {logo && <img src={logo} alt="Preview" style={{ height: '40px', marginTop: '10px', borderRadius: '4px' }} />}
                </div>
              </>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ 
                  color: error.includes('başarılı') ? '#4ade80' : '#f87171', 
                  fontSize: '13px', 
                  marginBottom: '20px', 
                  textAlign: 'center',
                  background: error.includes('başarılı') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                  padding: '10px',
                  borderRadius: '8px'
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '900',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: '0.3s',
              boxShadow: '0 10px 20px rgba(249, 115, 22, 0.3)'
            }}
          >
            {loading ? 'İşlem Yapılıyor...' : (isRegister ? 'Kayıt Ol' : 'Giriş Yap')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            onClick={() => setIsRegister(!isRegister)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#94a3b8', 
              fontSize: '14px', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Henüz hesabınız yok mu? Kayıt olun'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
