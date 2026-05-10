import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Settings, 
  Plus, 
  Trash2, 
  Zap,
  Layout,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  RotateCcw,
  BarChart3,
  FileText,
  MousePointer2,
  Calculator,
  Palette,
  Save,
  CheckCircle2,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Static UI Components ---

const SidebarItem = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`admin-nav-item ${activeTab === id ? 'active' : ''}`}
    style={{ 
      width: '100%', padding: '14px 20px', borderRadius: '14px', border: 'none', textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: '0.2s',
      background: activeTab === id ? '#1e293b' : 'transparent',
      color: activeTab === id ? 'white' : '#64748b',
      fontWeight: '700'
    }}
  >
    <Icon size={20} />
    <span style={{ fontSize: '14px' }}>{label}</span>
  </button>
);

const AdminCard = ({ title, subtitle, children, extra }) => (
  <div className="card-admin" style={{ marginBottom: '30px' }}>
    <div style={{ padding: '30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{subtitle}</p>}
      </div>
      {extra}
    </div>
    <div style={{ padding: '30px' }}>{children}</div>
  </div>
);

// --- Main Admin Component ---

const AdminPanel = ({ 
  data, 
  updateMaterials, 
  addMaterial,
  removeMaterial,
  updateParameters, 
  updateSection, 
  updateField, 
  updateLedSettings,
  reorderSections,
  resetData,
  manualSave,
  // Letter Types
  updateLetterTypes,
  addLetterType,
  removeLetterType,
  updateCompanyInfo
}) => {
  const [activeTab, setActiveTab] = useState('materials');
  const [activeFormSection, setActiveFormSection] = useState(data.sections[0]?.id || 'kutuHarf');
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved

  const handleManualSave = () => {
    setSaveStatus('saving');
    manualSave();
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const moveSection = (id, direction) => {
    const sections = [...data.sections];
    const index = sections.findIndex(s => s.id === id);
    if (direction === 'up' && index > 0) {
      [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    }
    reorderSections(sections);
  };

  const handleMaterialUpdate = (category, id, field, value) => {
    const updated = data.materials[category].map(m => m.id === id ? { ...m, [field]: value } : m);
    updateMaterials(category, updated);
  };

  const handleLetterTypeUpdate = (id, field, value) => {
    const updated = data.letterTypes.map(lt => lt.id === id ? { ...lt, [field]: value } : lt);
    updateLetterTypes(updated);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '300px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', padding: '30px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#f97316', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px' }}>R</div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>Admin <span style={{ color: '#f97316' }}>Panel</span></h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>{saveStatus === 'saved' ? 'DEĞİŞİKLİKLER KAYDEDİLDİ' : 'SİSTEM AKTİF'}</span>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          <SidebarItem id="dashboard" label="Dashboard" icon={BarChart3} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '10px 0' }} />
          <SidebarItem id="sections" label="Bölüm Yönetimi" icon={Layout} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="forms" label="Alan Yönetimi" icon={MousePointer2} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="materials" label="Malzeme Yönetimi" icon={Package} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '10px 0' }} />
          <SidebarItem id="pdf" label="PDF Yönetimi" icon={FileText} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="params" label="Sistem Ayarları" icon={Settings} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>

        <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <button 
            onClick={handleManualSave} 
            disabled={saveStatus === 'saving'}
            style={{ 
              width: '100%', padding: '14px', borderRadius: '12px', 
              backgroundColor: saveStatus === 'saved' ? '#4ade80' : '#1e293b', 
              color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', 
              marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: '0.3s'
            }}
          >
            {saveStatus === 'saving' ? 'Kaydediliyor...' : saveStatus === 'saved' ? <><CheckCircle2 size={18} /> Kaydedildi</> : <><Save size={18} /> Tümünü Kaydet</>}
          </button>
          
          <button onClick={resetData} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>
            <RotateCcw size={18} /> Sistemi Sıfırla
          </button>
          
          <button onClick={() => window.location.href = '/'} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#f97316', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <ArrowLeft size={18} /> Panelden Çık
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '50px' }}>
        <AnimatePresence mode="wait">
          
          {activeTab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div className="card-premium" style={{ padding: '30px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '900', marginBottom: '10px' }}>AKTİF BÖLÜMLER</div>
                  <div style={{ fontSize: '32px', fontWeight: '950' }}>{data.sections.filter(s => s.active).length}</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sections' && (
            <motion.div key="sections" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AdminCard title="Bölüm Yönetimi" subtitle="Müşteri panelindeki ana modülleri yönetin.">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {data.sections.map((section) => (
                    <div key={section.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button onClick={() => moveSection(section.id, 'up')} style={{ background: 'none', border: 'none', color: '#cbd5e1' }}><ChevronUp size={16} /></button>
                        <button onClick={() => moveSection(section.id, 'down')} style={{ background: 'none', border: 'none', color: '#cbd5e1' }}><ChevronDown size={16} /></button>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>{section.label}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                         <div 
                           onClick={() => {
                             const activeCount = data.sections.filter(s => s.active).length;
                             if (section.active && activeCount <= 1) {
                               alert('En az bir bölüm aktif kalmalıdır!');
                               return;
                             }
                             updateSection(section.id, { active: !section.active });
                           }} 
                           className="switch-container" 
                           style={{ width: '40px', height: '22px', background: section.active ? '#f97316' : '#e2e8f0' }}
                         >
                            <div className="switch-dot" style={{ width: '16px', height: '16px', left: section.active ? '21px' : '3px' }} />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminCard>
            </motion.div>
          )}

          {activeTab === 'forms' && (
            <motion.div key="forms" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                {data.sections.map(s => (
                  <button key={s.id} onClick={() => setActiveFormSection(s.id)} style={{ padding: '14px 28px', borderRadius: '15px', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', background: activeFormSection === s.id ? '#1e293b' : 'white', color: activeFormSection === s.id ? 'white' : '#94a3b8', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {data.sections.find(s => s.id === activeFormSection)?.groups.map(group => (
                <AdminCard key={group.id} title={group.label} subtitle="Bu gruptaki alanları yönetin.">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {group.fields.map((field) => (
                      <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <input 
                            className="input-base" 
                            style={{ border: 'none', padding: 0, fontSize: '15px', fontWeight: '800', width: '100%' }} 
                            value={field.label} 
                            onChange={(e) => updateField(activeFormSection, field.id, { label: e.target.value })} 
                          />
                          <div style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: '900', marginTop: '4px' }}>{field.type.toUpperCase()} • {field.grid}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                           <button onClick={() => updateField(activeFormSection, field.id, { showInPdf: !field.showInPdf })} style={{ background: 'none', border: 'none', color: field.showInPdf ? '#f97316' : '#cbd5e1', cursor: 'pointer' }}>
                              {field.showInPdf ? <Eye size={18} /> : <EyeOff size={18} />}
                           </button>
                           <div onClick={() => updateField(activeFormSection, field.id, { active: !field.active })} className="switch-container" style={{ width: '36px', height: '20px', background: field.active ? '#f97316' : '#e2e8f0' }}>
                              <div className="switch-dot" style={{ width: '14px', height: '14px', left: field.active ? '19px' : '3px' }} />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              ))}
            </motion.div>
          )}

          {activeTab === 'materials' && (
            <motion.div key="materials" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* KUTU HARF TÜRKLERİ (Special Section) */}
              <AdminCard title="KUTU HARF TÜRLERİ" subtitle="Kutu harf çeşitlerini ve cm birim fiyatlarını yönetin.">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(data.letterTypes || []).map(lt => (
                    <div key={lt.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '20px', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <input 
                        className="input-base" 
                        style={{ border: 'none', padding: 0, fontWeight: '800', width: '100%' }} 
                        value={lt.name} 
                        onChange={e => handleLetterTypeUpdate(lt.id, 'name', e.target.value)} 
                      />
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="number" 
                          className="input-base" 
                          style={{ paddingLeft: '30px' }} 
                          value={lt.price} 
                          onChange={e => handleLetterTypeUpdate(lt.id, 'price', parseFloat(e.target.value) || 0)} 
                        />
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#94a3b8' }}>₺</span>
                        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: '900', color: '#cbd5e1' }}>/ CM</span>
                      </div>
                      <button onClick={() => removeLetterType(lt.id)} className="btn-ghost" style={{ color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </div>
                  ))}
                  <button 
                    onClick={addLetterType} 
                    className="btn-primary" 
                    style={{ marginTop: '10px', padding: '16px', fontSize: '14px', background: '#f97316', color: 'white', width: '100%', fontWeight: '900', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
                  >
                    <Plus size={20} /> Yeni Harf Türü Ekle
                  </button>
                </div>
              </AdminCard>

              {/* Standard Materials */}
              {Object.keys(data.materials).filter(cat => cat !== 'front' && cat !== 'side').map(category => {
                const categoryLabels = {
                  lighting: 'AYDINLATMA MALZEMELERİ',
                  back: 'ZEMİN (BACK) MALZEMELERİ',
                  frame: 'DEMİR KASA MALZEMELERİ',
                  adapter: 'ADAPTÖR / GÜÇ KAYNAĞI',
                  vinc: 'VİNÇ KİRALAMA',
                  digital: 'DİJİTAL BASKI',
                  vinil: 'VİNİL BASKI',
                  lightbox: 'LIGHTBOX TABELA',
                  fener: 'FENER TABELA',
                  fener_movement: 'FENER MEKANİZMA'
                };
                const displayTitle = categoryLabels[category] || category.toUpperCase().replace('_', ' ');

                return (
                  <AdminCard key={category} title={displayTitle} subtitle={`${displayTitle.toLowerCase()} kategorisindeki çeşitleri ve fiyatlarını yönetin.`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.materials[category].map(m => (
                      <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '20px', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <input 
                          className="input-base" 
                          style={{ border: 'none', padding: 0, fontWeight: '800', width: '100%' }} 
                          value={m.name} 
                          onChange={e => handleMaterialUpdate(category, m.id, 'name', e.target.value)} 
                        />
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="number" 
                            className="input-base" 
                            style={{ paddingLeft: '30px' }} 
                            value={m.price} 
                            onChange={e => handleMaterialUpdate(category, m.id, 'price', parseFloat(e.target.value) || 0)} 
                          />
                          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#94a3b8' }}>₺</span>
                        </div>
                        <select className="input-base select-base" value={m.unit} onChange={e => handleMaterialUpdate(category, m.id, 'unit', e.target.value)}>
                          <option value="m2">m2</option>
                          <option value="adet">adet</option>
                          <option value="cm">cm</option>
                        </select>
                        <button onClick={() => removeMaterial(category, m.id)} className="btn-ghost" style={{ color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </div>
                    ))}
                    <button 
                      onClick={() => addMaterial(category)} 
                      className="btn-primary" 
                      style={{ 
                        marginTop: '20px', 
                        padding: '16px', 
                        fontSize: '14px', 
                        background: '#1e293b',
                        color: 'white',
                        width: '100%',
                        fontWeight: '900',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={20} /> Yeni {category.toUpperCase().replace('_', ' ')} Çeşidi Ekle
                    </button>
                  </div>
                </AdminCard>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'params' && (
            <motion.div key="params" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <AdminCard title="Global Parametreler" subtitle="Tüm tekliflerde kullanılan işçilik, kâr ve KDV oranlarını yönetin.">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                      <label className="label-xs">İŞÇİLİK ORANI (%)</label>
                      <input type="number" className="input-base" value={data.parameters.laborRate} onChange={e => updateParameters({ laborRate: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label className="label-xs">KÂR MARJI (%)</label>
                      <input type="number" className="input-base" value={data.parameters.profitMargin} onChange={e => updateParameters({ profitMargin: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label className="label-xs">KDV ORANI (%)</label>
                      <input type="number" className="input-base" value={data.parameters.taxRate} onChange={e => updateParameters({ taxRate: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
               </AdminCard>
            </motion.div>
          )}

          {activeTab === 'pdf' && (
            <motion.div key="pdf" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AdminCard title="Teklif & PDF Yönetimi" subtitle="Teklif dosyasındaki firma logonuza ve iletişim bilgilerinize müdahale edin.">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  
                  {/* Firma Logosu */}
                  <div style={{ gridColumn: 'span 2', padding: '30px', border: '2px dashed #e2e8f0', borderRadius: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '20px' }}>
                      {data.companyInfo?.logo ? (
                        <img src={data.companyInfo.logo} alt="Logo" style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#94a3b8' }}>
                          <Palette size={32} />
                        </div>
                      )}
                    </div>
                    <label style={{ cursor: 'pointer', background: '#1e293b', color: 'white', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '800' }}>
                      Logo Yükle (PNG/JPG)
                      <input 
                        type="file" 
                        hidden 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => updateCompanyInfo({ logo: reader.result });
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                    {data.companyInfo?.logo && (
                      <button 
                        onClick={() => updateCompanyInfo({ logo: '' })}
                        style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        Logoyu Kaldır
                      </button>
                    )}
                  </div>

                  {/* Firma Bilgileri */}
                  <div>
                    <label className="label-xs">FİRMA ADI</label>
                    <input 
                      className="input-base" 
                      value={data.companyInfo?.name || ''} 
                      onChange={e => updateCompanyInfo({ name: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="label-xs">SLOGAN / ALT BAŞLIK</label>
                    <input 
                      className="input-base" 
                      value={data.companyInfo?.slogan || ''} 
                      onChange={e => updateCompanyInfo({ slogan: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="label-xs">E-POSTA ADRESİ</label>
                    <input 
                      className="input-base" 
                      value={data.companyInfo?.email || ''} 
                      onChange={e => updateCompanyInfo({ email: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="label-xs">WEB SİTESİ</label>
                    <input 
                      className="input-base" 
                      value={data.companyInfo?.website || ''} 
                      onChange={e => updateCompanyInfo({ website: e.target.value })} 
                    />
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          )}


        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminPanel;
