export const initialData = {
  schemaVersion: 'v40_siento',
  appVersion: '3.0.0.0',
  appTag: 'TEKLİF360',
  sections: [
    {
      id: 'kutuHarf',
      label: 'KUTU HARF',
      active: true,
      showInCustomer: true,
      showInPdf: true,
      order: 1,
      groups: [
        {
          id: 'proje',
          label: 'Proje Yapılandırması',
          fields: [
            { id: 'typeId', label: 'HARF TÜRÜ', type: 'select', optionsSource: 'letterTypes', active: true, showInPdf: true, required: true, grid: 'col-span-3' },
            { id: 'height', label: 'YÜKSEKLİK (CM)', type: 'number', active: true, showInPdf: true, required: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'width', label: 'GENİŞLİK (CM)', type: 'number', active: true, showInPdf: true, required: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'count', label: 'HARF ADETİ', type: 'number', active: true, showInPdf: true, required: true, grid: 'col-span-3', placeholder: 'Adet' },
            { id: 'isPile', label: 'Pileli Üretim', type: 'checkbox', active: true, showInPdf: true, grid: 'col-span-1' },
            { id: 'isOnCNC', label: 'Ön Yüz CNC', type: 'checkbox', active: true, showInPdf: true, grid: 'col-span-1' }
          ]
        },
        {
          id: 'malzeme',
          label: 'Malzeme Seçimi',
          fields: [
            { id: 'lightingMaterialId', label: 'AYDINLATMA', type: 'select', optionsSource: 'materials.lighting', active: true, showInPdf: true, required: true, grid: 'col-span-3' },
            { id: 'backMaterialId', label: 'ARKA PLAN MALZEMESİ', type: 'select', optionsSource: 'materials.back', active: true, showInPdf: true, required: true, grid: 'col-span-1' },
            { id: 'arkaPlanL', label: 'UZUNLUK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'arkaPlanW', label: 'GENİŞLİK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'adapterId', label: 'ADAPTÖR', type: 'select', optionsSource: 'materials.adapter', active: true, showInPdf: true, required: true, grid: 'col-span-3' }
          ]
        }
      ]
    },
    {
      id: 'dijitalBaski',
      label: 'DİJİTAL BASKI',
      active: true,
      showInCustomer: true,
      showInPdf: true,
      order: 2,
      groups: [
        {
          id: 'db_main',
          label: 'Dijital Baskı Yapılandırması',
          fields: [
            { id: 'db_material_id', label: 'MATERYAL', type: 'select', optionsSource: 'materials.digital', active: true, showInPdf: true, grid: 'col-span-3' },
            { id: 'db_type', label: 'BASKI TÜRÜ', type: 'select', options: ['Dış Mekan', 'İç Mekan', 'UV Baskı'], active: true, showInPdf: true, grid: 'col-span-3' },
            { id: 'db_width', label: 'GENİŞLİK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'db_height', label: 'YÜKSEKLİK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' }
          ]
        }
      ]
    },
    {
      id: 'vinilBaski',
      label: 'VİNİL BASKI',
      active: true,
      showInCustomer: true,
      showInPdf: true,
      order: 3,
      groups: [
        {
          id: 'vb_main',
          label: 'Vinil Germe Tabela Yapılandırması',
          fields: [
            { id: 'vb_material_id', label: 'TABELA TÜRÜ', type: 'select', optionsSource: 'materials.vinil', active: true, showInPdf: true, grid: 'col-span-3' },
            { id: 'vb_width', label: 'GENİŞLİK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'vb_height', label: 'YÜKSEKLİK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'vb_depth', label: 'DERİNLİK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'demirKasaId', label: 'DEMİR KASA MALZEMESİ', type: 'select', optionsSource: 'materials.frame', active: true, showInPdf: true, grid: 'col-span-1' },
            { id: 'dkL', label: 'KASA UZUNLUK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'dkW', label: 'KASA GENİŞLİK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' }
          ]
        }
      ]
    },
    {
      id: 'lightbox',
      label: 'LIGHTBOX',
      active: true,
      showInCustomer: true,
      showInPdf: true,
      order: 4,
      groups: [
        {
          id: 'lb_main',
          label: 'LİGHTBOX TABELA',
          fields: [
            { id: 'lb_material_id', label: 'TABELA TÜRÜ', type: 'select', optionsSource: 'materials.lightbox', active: true, showInPdf: true, grid: 'col-span-3' },
            { id: 'lb_width', label: 'GENİŞLİK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'lb_height', label: 'YÜKSEKLİK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' },
            { id: 'lb_depth', label: 'DERİNLİK (CM)', type: 'number', active: true, showInPdf: true, grid: 'col-span-1', placeholder: 'Cm' }
          ]
        }
      ]
    },
    {
      id: 'fenerTabela',
      label: 'FENER TABELA',
      active: true,
      showInCustomer: true,
      showInPdf: true,
      order: 5,
      groups: [
        {
          id: 'ft_main',
          label: 'FENER TABELA YAPILANDIRMASI',
          fields: [
            { id: 'ft_type', label: 'TABELA TÜRÜ', type: 'select', options: ['Işıklı Fener'], active: true, showInPdf: true, grid: 'col-span-3' },
            { id: 'ft_material_id', label: 'ÖLÇÜ SEÇİMİ', type: 'select', optionsSource: 'materials.fener', active: true, showInPdf: true, grid: 'col-span-3' },
            { id: 'ft_movement_id', label: 'HAREKETLİ & SABİT', type: 'select', optionsSource: 'materials.fener_movement', active: true, showInPdf: true, grid: 'col-span-3' },
            { id: 'ft_color', label: 'KASA RENGİ', type: 'select', options: ['Siyah', 'Diğer'], active: true, showInPdf: true, grid: 'col-span-3' },
            { id: 'ft_custom_color_name', label: 'ÖZEL RENK ADI', type: 'text', active: true, showInPdf: true, grid: 'col-span-3', placeholder: 'Renk adını giriniz...', dependsOn: { field: 'ft_color', value: 'Diğer' } },
            { id: 'ft_custom_color_price', label: 'ÖZEL RENK EK FİYAT', type: 'number', active: true, showInPdf: true, grid: 'col-span-3', placeholder: '0.00', dependsOn: { field: 'ft_color', value: 'Diğer' } }
          ]
        }
      ]
    },
    {
      id: 'ekHizmetler',
      label: 'MONTAJ, NAKLİYE VE VİNÇ',
      active: true,
      showInCustomer: true,
      showInPdf: true,
      order: 6,
      groups: [
        {
          id: 'eh_main',
          label: 'Ek Hizmet Bedelleri',
          fields: [
            { id: 'eh_montaj', label: 'MONTAJ ÜCRETİ (₺)', type: 'number', active: true, showInPdf: true, grid: 'col-span-3', placeholder: '0.00' },
            { id: 'eh_vinc_id', label: 'VİNÇ KİRALAMA', type: 'select', optionsSource: 'materials.vinc', active: true, showInPdf: true, grid: 'col-span-3' },
            { id: 'eh_nakliye', label: 'NAKLİYE BEDELİ (₺)', type: 'number', active: true, showInPdf: true, grid: 'col-span-3', placeholder: '0.00' }
          ]
        }
      ]
    }
  ],
  companyInfo: {
    name: 'Siento Creative',
    slogan: 'PROFESYONEL REKLAM VE TABELA ÇÖZÜMLERİ',
    email: 'info@sientocreative.com',
    website: 'www.sientocreative.com',
    logo: ''
  },
  letterTypes: [
    { id: 'lt1', name: 'Önden Aydınlatmalı Alüminyum Yanak', price: 40 },
    { id: 'lt2', name: 'Arkadan Aydınlatmalı (Krom)', price: 65 },
    { id: 'lt3', name: 'Işıksız Kutu Harf Alüminyum Yanak', price: 35 },
    { id: 'lt4', name: 'Önden ve Yandan Işıklı Kutu Harf Pleksi Yanak', price: 55 }
  ],
  materials: {
    lighting: [
      { id: 'l1', name: '3\' Lü Mercekli Modül Led', price: 35, unit: 'adet' }
    ],
    back: [
      { id: 'b1', name: 'Dekota 5mm', price: 450, unit: 'm2' },
      { id: 'b2', name: 'Alüminyum Kompozit', price: 1600, unit: 'm2' }
    ],
    frame: [
      { id: 'fr1', name: '40x40 Demir Profil', price: 850, unit: 'm2' },
      { id: 'fr2', name: '30x20 Demir Profil', price: 450, unit: 'm2' }
    ],
    adapter: [
      { id: 'a1', name: '30A İç Mekan', price: 1500, unit: 'adet' },
      { id: 'a2', name: '40A İç Mekan', price: 1850, unit: 'adet' }
    ],
    vinc: [
      { id: 'v0', name: 'Yok', price: 0, unit: 'adet' },
      { id: 'v1', name: 'Vinç Kiralama (Günlük)', price: 2500, unit: 'adet' }
    ],
    digital: [
      { id: 'd1', name: 'Folyo Baskı', price: 250, unit: 'm2' },
      { id: 'd2', name: 'One Way Vision', price: 450, unit: 'm2' }
    ],
    vinil: [
      { id: 'v1', name: 'Işıklı Vinil Germe', price: 650, unit: 'm2' },
      { id: 'v2', name: 'Işıksız Vinil Germe', price: 450, unit: 'm2' }
    ],
    lightbox: [
      { id: 'lb1', name: 'Tek Taraflı Lightbox', price: 2500, unit: 'm2' },
      { id: 'lb2', name: 'Çift Taraflı Lightbox', price: 4500, unit: 'm2' }
    ],
    fener: [
      { id: 'ft1', name: '50 CM Yuvarlak', price: 7000, unit: 'adet' },
      { id: 'ft2', name: '60 CM Kare', price: 8500, unit: 'adet' }
    ],
    fener_movement: [
      { id: 'fm1', name: 'Sabit', price: 0, unit: 'adet' },
      { id: 'fm2', name: 'Döner Mekanizma', price: 2500, unit: 'adet' }
    ]
  },
  parameters: {
    laborRate: 0,
    profitMargin: 0,
    taxRate: 20
  }
};
