import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  User,
  MapPin,
  Printer,
  CircleOff,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateProject } from '../../shared/utils/calculator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Helper Functions ---

const getOptions = (field, data) => {
  if (field.options) return field.options;
  if (field.optionsSource) {
    const parts = field.optionsSource.split('.');
    if (parts[0] === 'materials') return data.materials[parts[1]] || [];
    if (parts[0] === 'letterTypes') return data.letterTypes || [];
  }
  return [];
};

const getInitialFormValues = (sectionId, data) => {
  const initialState = {};
  const section = data.sections.find(s => s.id === sectionId);
  if (!section) return {};

  section.groups.forEach(g => {
    g.fields.forEach(f => {
      // Default ALL fields to empty string to show "Seçiniz" or empty input
      initialState[f.id] = f.type === 'checkbox' ? false : '';
    });
  });

  return initialState;
};

// --- Atomic Components ---

const UISwitch = ({ checked, onChange }) => (
  <div
    onClick={() => onChange(!checked)}
    className="switch-container"
    style={{ background: checked ? '#4ade80' : '#cbd5e1' }}
  >
    <div className="switch-dot" style={{ left: checked ? '27px' : '3px' }} />
  </div>
);

const UIField = ({ label, grid = "col-span-1", disabled, children }) => (
  <div className={grid} style={{ marginBottom: '25px', opacity: disabled ? 0.4 : 1, transition: '0.3s', pointerEvents: disabled ? 'none' : 'auto' }}>
    <label className="label-xs">{label}</label>
    {children}
  </div>
);

// --- Main Application ---

const CustomerPanel = ({
  data,
  updateSection,
  addItem,
  removeItem,
  updateItemForm
}) => {
  const API_BASE = 'http://127.0.0.1:5000/api';
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const pdfRef = useRef(null);

  // Results calculation for all forms
  const results = useMemo(() => calculateProject(data.forms, data), [data.forms, data.materials, data.parameters, data.sections]);

  // Sync / Initialize items if they are empty
  useEffect(() => {
    data.sections.forEach(section => {
      const items = data.forms[section.id] || [];
      items.forEach(item => {
        // If item only has ID (initial state), populate with defaults
        if (Object.keys(item).length <= 2) { // id and active
          const defaults = getInitialFormValues(section.id, data);
          updateItemForm(section.id, item.id, defaults);
        }
      });
    });
  }, [data.forms, data.sections]);

  const handleFieldChange = (sectionId, itemId, fieldId, value) => {
    updateItemForm(sectionId, itemId, { [fieldId]: value });
  };

  // --- Recent Customers SQL Logic ---
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentCustomers, setRecentCustomers] = useState([]);

  const fetchRecentCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/recent-customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setRecentCustomers(list || []);
      }
    } catch (e) { console.error("Fetch error:", e); }
  }, [API_BASE]);

  useEffect(() => {
    fetchRecentCustomers();
  }, [fetchRecentCustomers]);

  const saveToRecent = async (name, address) => {
    if (!name || name.trim().length < 2) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/recent-customers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name, address })
      });
      
      if (res.ok) {
        fetchRecentCustomers();
      } else {
        console.error("Save failed with status:", res.status);
      }
    } catch (e) { console.error("Save error:", e); }
  };

  const handleDownloadPDF = async () => {
    const pages = document.querySelectorAll('.pdf-page-block');
    if (!pages.length) {
      alert("Teklif içeriği bulunamadı.");
      return;
    }

    try {
      // Save to recent
      saveToRecent(customerName, customerAddress);

      // Button loading state
      const downloadButtons = document.querySelectorAll('button');
      const btn = Array.from(downloadButtons).find(b => b.innerText.includes('PDF İNDİR'));
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "LÜTFEN BEKLEYİN...";
      }

      console.log("PDF generation started (Pro Quality Mode)...");
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgWidth = 210;
      const pageHeight = 297;

      for (let i = 0; i < pages.length; i++) {
        // Temporarily remove shadow for clean capture
        const originalShadow = pages[i].style.boxShadow;
        pages[i].style.boxShadow = 'none';

        const canvas = await html2canvas(pages[i], {
          scale: 2, // High definition
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        // Restore shadow for UI
        pages[i].style.boxShadow = originalShadow;

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, pageHeight, undefined, 'FAST');
        
        await new Promise(r => setTimeout(r, 50));
      }

      const fileName = `Teklif_${(customerName || 'Musteri').replace(/\s/g, '_')}.pdf`;
      pdf.save(fileName);
      
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = "PDF İNDİR";
        }
        setShowPreview(false);
      }, 500);
    } catch (e) { 
      console.error("PDF Export Critical Error:", e);
      alert("PDF oluşturulamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
    }
  };

  return (
    <div className="main-layout">

      {/* 1. Header Information */}
      <div className="grid-2">
        <UIField label="TEKLİF VERİLECEK MÜŞTERİ">
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <User size={14} style={{ position: 'absolute', left: '15px', color: '#94a3b8', zIndex: 10 }} />
              <input 
                className="input-base" 
                style={{ paddingLeft: '40px' }} 
                placeholder="Müşteri adını giriniz..." 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
              />
            </div>
          </div>
        </UIField>
        <UIField label="MÜŞTERİ ADRESİ">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <MapPin size={14} style={{ position: 'absolute', left: '15px', color: '#94a3b8' }} />
            <input className="input-base" style={{ paddingLeft: '40px' }} placeholder="Müşteri adresini giriniz..." value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
          </div>
        </UIField>
      </div>

      <div className="flex-row-gap">

        {/* Left Column: Dynamic Sections */}
        <div style={{ flex: 1 }}>
          {data.sections.filter(s => s.showInCustomer).map(section => {
            const items = data.forms[section.id] || [];

            return (
              <section key={section.id} id={section.id} className="fade-in" style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: section.active ? '#f97316' : '#cbd5e1' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '950', color: section.active ? '#1e293b' : '#94a3b8' }}>{section.label}</h2>
                  </div>
                  <UISwitch checked={section.active} onChange={(val) => updateSection(section.id, { active: val })} />
                </div>

                <AnimatePresence>
                  {section.active && items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="card-premium"
                      style={{ marginBottom: '20px', position: 'relative' }}
                    >
                      {/* Item Header / Remove Button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#f97316', letterSpacing: '1px' }}>
                          #{index + 1} YAPILANDIRMA
                        </span>
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(section.id, item.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '800' }}
                          >
                            <Trash2 size={14} /> SİL
                          </button>
                        )}
                      </div>

                      {section.groups.map(group => (
                        <div key={group.id} style={{ marginBottom: '30px' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '20px', color: '#64748b' }}>{group.label}</h3>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 20px' }}>
                            {group.fields.filter(f => f.active && f.type !== 'checkbox').map(field => {
                              // Conditional visibility check
                              if (field.dependsOn) {
                                const parentValue = item[field.dependsOn.field];
                                if (parentValue !== field.dependsOn.value) return null;
                              }

                              return (
                                <UIField key={field.id} label={field.label} grid={field.grid || 'col-span-1'}>
                                  {field.type === 'number' ? (
                                    <input
                                      type="number"
                                      className="input-base"
                                      placeholder={field.placeholder || 'Cm'}
                                      value={item[field.id] || ''}
                                      onChange={e => handleFieldChange(section.id, item.id, field.id, e.target.value)}
                                    />
                                  ) : field.type === 'text' ? (
                                    <input
                                      type="text"
                                      className="input-base"
                                      placeholder={field.placeholder || 'Metin giriniz...'}
                                      value={item[field.id] || ''}
                                      onChange={e => handleFieldChange(section.id, item.id, field.id, e.target.value)}
                                    />
                                  ) : (
                                    <select className="input-base select-base" value={item[field.id] || ''} onChange={e => handleFieldChange(section.id, item.id, field.id, e.target.value)}>
                                      <option value="">Seçiniz...</option>
                                      {getOptions(field, data).map(opt => (
                                        <option key={opt.id || opt} value={opt.id || opt}>{opt.name || opt}</option>
                                      ))}
                                    </select>
                                  )}
                                </UIField>
                              );
                            })}
                          </div>

                          {group.fields.some(f => f.type === 'checkbox') && (
                            <div className="grid-2" style={{ marginTop: '10px' }}>
                              {group.fields.filter(f => f.active && f.type === 'checkbox').map(field => (
                                <label key={field.id} className="check-item">
                                  <input type="checkbox" checked={item[field.id] || false} onChange={e => handleFieldChange(section.id, item.id, field.id, e.target.checked)} />
                                  <span>{field.label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Section Specific info (e.g. LED count) */}
                      {section.id === 'kutuHarf' && item.height && (
                        <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#fff7ed', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#c2410c' }}>BU KALEM İÇİN LED ADETİ</div>
                          <div style={{ fontSize: '20px', fontWeight: '950', color: '#f97316' }}>{Math.max(3, Math.min(15, Math.floor(parseFloat(item.height) / 5))) * (parseFloat(item.count) || 0)} Adet</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* ADD BUTTON (Mandatory) */}
                {section.active && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                    <button
                      onClick={() => addItem(section.id)}
                      style={{
                        padding: '12px 25px', borderRadius: '12px', border: '2px dashed #f97316', backgroundColor: '#fff', color: '#f97316', fontWeight: '950', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.3s'
                      }}
                      onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fff7ed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <Plus size={18} /> EKLE +
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Sidebar Summary */}
        <aside style={{ width: '420px' }}>
          <div className="summary-premium">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '950' }}>Teklif <span style={{ color: '#f97316' }}>Özeti</span></h2>
              <ShieldCheck size={32} />
            </div>

            <div style={{ marginBottom: '30px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginBottom: '15px' }}>AKTİF KALEMLER</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <AnimatePresence>
                  {results.items.map((item, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '12px', borderBottom: '1px solid #f8fafc' }}>
                      <span style={{ color: '#64748b', fontWeight: '600', maxWidth: '70%' }}>• {item.name}</span>
                      <span style={{ fontWeight: '800', color: '#1e293b' }}>{item.price.toLocaleString('tr-TR')} ₺</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {results.items.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '700', border: '1px dashed #e2e8f0', borderRadius: '15px' }}>Henüz aktif bir kalem bulunmuyor.</div>
                )}
              </div>
            </div>

            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontWeight: '600', color: '#64748b', fontSize: '12px' }}>Malzeme Toplamı</span>
                <span style={{ fontWeight: '700', fontSize: '13px' }}>{results.totalMaterials.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px dashed #e2e8f0', marginTop: '5px' }}>
                <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>Ara Toplam</span>
                <span style={{ fontWeight: '800', fontSize: '15px' }}>{results.totalSatis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontWeight: '700', color: '#64748b', fontSize: '13px' }}>KDV (%{data.parameters.taxRate})</span>
                <span style={{ fontWeight: '800', fontSize: '15px' }}>{results.kdv.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>
            </div>

            <div className="final-box">
              <div style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '3px', color: '#94a3b8', marginBottom: '8px' }}>GENEL TOPLAM</div>
              <div style={{ fontSize: '32px', fontWeight: '950', color: '#1e293b' }}>{results.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
            </div>

            <button 
              className="btn-primary w-full" 
              style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              onClick={() => {
                saveToRecent(customerName, customerAddress);
                setShowPreview(true);
              }}
            >
              <FileText size={18} />
              TEKLİF DOSYASINI HAZIRLA
            </button>
          </div>
        </aside>
      </div>

      {/* PDF PREVIEW MODAL */}
      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 20000, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', overflowY: 'auto' }}>
            <div style={{ width: '100%', maxWidth: '850px', display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', gap: '15px' }}>
              <button onClick={handleDownloadPDF} style={{ padding: '12px 30px', borderRadius: '12px', backgroundColor: '#f97316', color: 'white', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Download size={18} /> PDF İNDİR</button>
              <button onClick={() => setShowPreview(false)} style={{ padding: '12px 30px', borderRadius: '12px', backgroundColor: 'white', color: '#1e293b', border: 'none', fontWeight: '900', cursor: 'pointer' }}>KAPAT</button>
            </div>

            <div className="pdf-pages-container" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {(() => {
                const itemsPerPageFirst = 12;
                const itemsPerPageOthers = 18;
                const pages = [];
                let currentItems = [...results.items];
                
                let pageIndex = 0;
                while (currentItems.length > 0 || pageIndex === 0) {
                  const limit = pageIndex === 0 ? itemsPerPageFirst : itemsPerPageOthers;
                  pages.push({
                    index: pageIndex,
                    items: currentItems.splice(0, limit),
                    isLast: currentItems.length === 0
                  });
                  pageIndex++;
                  if (pageIndex > 20) break; 
                }

                return pages.map((page, pIdx) => (
                  <div key={pIdx} className="pdf-page-block" style={{ width: '210mm', height: '297mm', backgroundColor: 'white', padding: '20mm', color: '#1e293b', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', flexShrink: 0 }}>
                    
                    {pIdx === 0 && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #f97316', paddingBottom: '30px', marginBottom: '40px' }}>
                          <div>
                            {data.companyInfo?.logo ? (
                              <img src={data.companyInfo.logo} alt="Logo" crossOrigin="anonymous" style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain', marginBottom: '10px', display: 'block' }} />
                            ) : (
                              <h1 style={{ fontSize: '32px', fontWeight: '950', letterSpacing: '-1px' }}>
                                {data.companyInfo?.name?.split(' ')[0]} <span style={{ color: '#f97316' }}>{data.companyInfo?.name?.split(' ').slice(1).join(' ')}</span>
                              </h1>
                            )}
                            <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', marginTop: '5px' }}>{data.companyInfo?.slogan || 'PROFESYONEL REKLAM VE TABELA ÇÖZÜMLERİ'}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', fontWeight: '900', color: '#f97316' }}>
                              TEKLİF NO: #{(data.companyInfo?.name || 'ERKA').substring(0, 4).toUpperCase().replace(/\s/g, '')}-{Date.now().toString().slice(-6)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>TARİH: {new Date().toLocaleDateString('tr-TR')}</div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: '900', color: '#f97316', letterSpacing: '2px', marginBottom: '10px' }}>MÜŞTERİ BİLGİLERİ</div>
                            <div style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>{customerName || '—'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', lineHeight: '1.6' }}>{customerAddress || '—'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', fontWeight: '900', color: '#f97316', letterSpacing: '2px', marginBottom: '10px' }}>FİRMA BİLGİLERİ</div>
                            <div style={{ fontSize: '14px', fontWeight: '900' }}>{data.companyInfo?.name || 'Er-Ka Reklam'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>{data.companyInfo?.email || 'info@erkareklam.com'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{data.companyInfo?.website || 'www.erkareklam.com'}</div>
                          </div>
                        </div>
                      </>
                    )}

                    {pIdx > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>{data.companyInfo?.name} - TEKLİF DEVAMI</span>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>SAYFA {pIdx + 1}</span>
                      </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                          <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '10px', fontWeight: '900' }}>HİZMET / MALZEME AÇIKLAMASI</th>
                          <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '10px', fontWeight: '900' }}>TUTAR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {page.items.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 15px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>{item.name}</td>
                            <td style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', fontWeight: '800' }}>{item.price.toLocaleString('tr-TR')} ₺</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {page.isLast && (
                      <div style={{ marginLeft: 'auto', width: '250px', marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Ara Toplam</span>
                          <span style={{ fontSize: '12px', fontWeight: '900' }}>{results.totalSatis.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>KDV (%{data.parameters.taxRate})</span>
                          <span style={{ fontSize: '12px', fontWeight: '900' }}>{results.kdv.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 10px', backgroundColor: '#f8fafc', marginTop: '10px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '950', color: '#1e293b' }}>GENEL TOPLAM</span>
                          <span style={{ fontSize: '16px', fontWeight: '950', color: '#f97316' }}>{results.grandTotal.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      </div>
                    )}

                    <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '700', lineHeight: '1.5' }}>
                        <div>• Bu teklif 15 gün süreyle geçerlidir.</div>
                        <div>• Sipariş onayı sonrası %50 ön ödeme alınmaktadır.</div>
                        <div>• Kalan ödeme iş tesliminde tahsil edilir.</div>
                        <div>• Tasarım onayı sonrası üretime başlanmaktadır.</div>
                        <div>• Montaj ve nakliye duruma göre ayrıca fiyatlandırılabilir.</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '700' }}>Bu teklif Siento Creative yazılım sistemi ile oluşturulmuştur.</div>
                        <div style={{ fontSize: '8px', color: '#f97316', fontWeight: '900', marginTop: '2px' }}>SAYFA {pIdx + 1} / {pages.length}</div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerPanel;
