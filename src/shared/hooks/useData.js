import { useState, useEffect, useCallback } from 'react';
import { initialData } from '../data/initialData';

export const useData = () => {
  const SCHEMA_VERSION = 'v40_siento'; 
  const [apiBase, setApiBase] = useState('http://127.0.0.1:5000');

  useEffect(() => {
    const initApi = async () => {
      if (window.electronAPI && window.electronAPI.getApiUrl) {
        const url = await window.electronAPI.getApiUrl();
        if (url) setApiBase(url);
      }
    };
    initApi();
  }, []);

  const API_BASE = `${apiBase}/api`;

  const [data, setData] = useState(() => {
    // Initial Empty Forms
    const initialForms = {};
    initialData.sections.forEach(s => {
      initialForms[s.id] = [{ id: `${s.id}_default`, active: true }]; 
    });

    return { 
      ...initialData, 
      schemaVersion: SCHEMA_VERSION,
      forms: initialForms
    };
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('reklamcu_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- API Sync Logic ---

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('reklamcu_token');
      if (!token || !user) return;

      try {
        const response = await fetch(`${API_BASE}/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const remoteData = await response.json();
          setData(prev => ({
            ...prev,
            companyInfo: remoteData.companyInfo || prev.companyInfo,
            parameters: remoteData.parameters || prev.parameters,
            materials: remoteData.materials || prev.materials,
            letterTypes: remoteData.letterTypes || prev.letterTypes
          }));
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
      }
    };

    fetchSettings();
  }, [user, apiBase]);

  const saveToBackend = async (type, updates) => {
    const token = localStorage.getItem('reklamcu_token');
    if (!token) return;

    try {
      // For materials and letterTypes, we send them within 'parameters' endpoint
      const body = type === 'company' ? updates : {
        tax_rate: data.parameters.taxRate,
        profit_margin: data.parameters.profitMargin,
        labor_rate: data.parameters.laborRate,
        materials: type === 'materials' ? updates : data.materials,
        letter_types: type === 'letterTypes' ? updates : data.letterTypes
      };

      const endpoint = type === 'company' ? 'company' : 'parameters';

      await fetch(`${API_BASE}/settings/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error("API Save Error:", err);
    }
  };

  // --- Multi-Item Management ---

  const addItem = (sectionId) => {
    setData(prev => {
      const newId = `${sectionId}_${Date.now()}`;
      const newItem = { id: newId, active: true };
      return {
        ...prev,
        forms: {
          ...prev.forms,
          [sectionId]: [...(prev.forms[sectionId] || []), newItem]
        }
      };
    });
  };

  const removeItem = (sectionId, itemId) => {
    setData(prev => {
      const sectionItems = prev.forms[sectionId] || [];
      if (sectionItems.length <= 1) {
        return {
          ...prev,
          forms: {
            ...prev.forms,
            [sectionId]: [{ id: `${sectionId}_reset`, active: true }]
          }
        };
      }
      return {
        ...prev,
        forms: {
          ...prev.forms,
          [sectionId]: sectionItems.filter(item => item.id !== itemId)
        }
      };
    });
  };

  const updateItemForm = (sectionId, itemId, updates) => {
    setData(prev => ({
      ...prev,
      forms: {
        ...prev.forms,
        [sectionId]: (prev.forms[sectionId] || []).map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      }
    }));
  };

  // --- Admin Methods ---

  const updateMaterials = (category, items) => {
    const newMaterials = { ...data.materials, [category]: items };
    setData(prev => ({
      ...prev,
      materials: newMaterials
    }));
    saveToBackend('materials', newMaterials);
  };

  const addMaterial = (category) => {
    const newId = `m_${Date.now()}`;
    const newItem = { id: newId, name: 'Yeni Malzeme', price: 0, unit: 'm2' };
    
    setData(prev => {
      const updated = { 
        ...prev.materials, 
        [category]: [...(prev.materials[category] || []), newItem] 
      };
      saveToBackend('materials', updated);
      return { ...prev, materials: updated };
    });
  };

  const removeMaterial = (category, id) => {
    setData(prev => {
      const updated = { 
        ...prev.materials, 
        [category]: (prev.materials[category] || []).filter(m => m.id !== id) 
      };
      saveToBackend('materials', updated);
      return { ...prev, materials: updated };
    });
  };

  const updateLetterTypes = (items) => {
    setData(prev => ({ ...prev, letterTypes: items }));
    saveToBackend('letterTypes', items);
  };

  const addLetterType = () => {
    setData(prev => {
      const newId = `lt_${Date.now()}`;
      const newItem = { id: newId, name: 'Yeni Harf Türü', price: 0 };
      const updated = [...(prev.letterTypes || []), newItem];
      saveToBackend('letterTypes', updated);
      return { ...prev, letterTypes: updated };
    });
  };

  const removeLetterType = (id) => {
    setData(prev => {
      const updated = (prev.letterTypes || []).filter(lt => lt.id !== id);
      saveToBackend('letterTypes', updated);
      return { ...prev, letterTypes: updated };
    });
  };

  const updateParameters = (newParams) => {
    const updated = { ...data.parameters, ...newParams };
    setData(prev => ({ ...prev, parameters: updated }));
    saveToBackend('parameters', updated);
  };

  const updateCompanyInfo = (updates) => {
    const updated = { ...data.companyInfo, ...updates };
    setData(prev => ({ ...prev, companyInfo: updated }));
    saveToBackend('company', updated);
  };

  const updateSection = (sectionId, updates) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
    }));
  };

  const updateField = (sectionId, fieldId, updates) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          groups: s.groups.map(g => ({
            ...g,
            fields: g.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
          }))
        };
      })
    }));
  };

  const resetData = () => {
    if (window.confirm("Tüm ayarlar sıfırlanacak. Emin misiniz?")) {
      window.location.reload();
    }
  };

  const logout = () => {
    localStorage.removeItem('reklamcu_token');
    localStorage.removeItem('reklamcu_user');
    setUser(null);
    window.location.reload();
  };

  return {
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
    reorderSections: (newSections) => setData(prev => ({ ...prev, sections: newSections })),
    manualSave: () => {},
    addItem,
    removeItem,
    updateItemForm,
    updateLetterTypes,
    addLetterType,
    removeLetterType,
    updateCompanyInfo
  };
};
