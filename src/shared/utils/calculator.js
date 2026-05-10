/**
 * Precise 6-Step Calculation Engine (Multi-Item Support)
 * Refined for Industry-Standard Box Letter formulas (Longest Edge Base).
 */

export const calculateProject = (allForms, data) => {
  const materials = data.materials;
  const params = data.parameters;

  let grandTotal = 0;
  let totalSatis = 0;
  let totalKdv = 0;
  let totalMaterialsAll = 0;
  let globalItems = [];
  let globalLedCount = 0;

  if (!allForms) return { items: [], totalMaterials: 0, totalSatis: 0, kdv: 0, grandTotal: 0, ledCount: 0 };

  const parsePrice = (p) => {
    if (typeof p === 'number') return p;
    if (!p) return 0;
    return parseFloat(String(p).replace(/[^\d.-]/g, '')) || 0;
  };

  Object.keys(allForms).forEach(sectionId => {
    const items = allForms[sectionId] || [];
    const sectionSchema = data.sections.find(s => s.id === sectionId);

    if (!sectionSchema || !sectionSchema.active) return;

    items.forEach((form, idx) => {
      if (form.active === false) return;

      let itemTotalMaterials = 0;
      let itemLedCount = 0;
      const labelPrefix = items.length > 1 ? `${sectionSchema.label} #${idx + 1}: ` : `${sectionSchema.label}: `;

      // --- 1. KUTU HARF ---
      if (sectionId === 'kutuHarf') {
        const h = parseFloat(form.height) || 0;
        const w = parseFloat(form.width) || 0;
        const count = parseFloat(form.count) || 0;
        const letterType = data.letterTypes?.find(t => t.id === form.typeId);

        if ((h > 0 || w > 0) && count > 0 && letterType) {
          // A) Base Formation Cost
          const longestEdge = Math.max(h, w);
          const basePrice = parsePrice(letterType.price);
          const baseCost = longestEdge * count * basePrice;
          itemTotalMaterials += baseCost;
          globalItems.push({ name: `${labelPrefix}${letterType.name} (Kasa)`, price: baseCost });

          // B) Back Material
          const backMaterial = materials.back?.find(m => m.id === form.backMaterialId);
          if (backMaterial) {
            const backL = parseFloat(form.arkaPlanL) || 0;
            const backW = parseFloat(form.arkaPlanW) || 0;
            const backAreaM2 = (backL / 100) * (backW / 100);
            const backCost = backAreaM2 * parsePrice(backMaterial.price);
            itemTotalMaterials += backCost;
            if (backCost > 0) globalItems.push({ name: `${labelPrefix}Arka Plan: ${backMaterial.name} (${backL}x${backW}cm)`, price: backCost });
          }

          // E) Demir Kasa
          const frameMaterial = materials.frame?.find(m => m.id === form.demirKasaId);
          if (frameMaterial) {
            const dkL = parseFloat(form.dkL) || 0;
            const dkW = parseFloat(form.dkW) || 0;
            const dkAreaM2 = (dkL / 100) * (dkW / 100);
            const dkCost = dkAreaM2 * parsePrice(frameMaterial.price);
            itemTotalMaterials += dkCost;
            if (dkCost > 0) globalItems.push({ name: `${labelPrefix}Demir Kasa: ${frameMaterial.name} (${dkL}x${dkW}cm)`, price: dkCost });
          }

          // F) LED
          const ledPerLetter = Math.max(3, Math.min(15, Math.floor(longestEdge / 5)));
          itemLedCount = ledPerLetter * count;
          globalLedCount += itemLedCount;

          const lightingObj = materials.lighting?.find(m => m.id === form.lightingMaterialId);
          const ledPrice = parsePrice(lightingObj?.price);
          const ledCost = itemLedCount * ledPrice;
          itemTotalMaterials += ledCost;
          if (ledCost > 0) globalItems.push({ name: `${labelPrefix}LED Aydınlatma (${itemLedCount} Adet)`, price: ledCost });

          // G) Adapter
          const adapterObj = materials.adapter?.find(m => m.id === form.adapterId);
          const adapterPrice = parsePrice(adapterObj?.price);
          if (adapterPrice > 0 && itemLedCount > 0) {
            const adapterCount = Math.ceil(itemLedCount / 300);
            const adapterCost = adapterCount * adapterPrice;
            itemTotalMaterials += adapterCost;
            globalItems.push({ name: `${labelPrefix}Güç Kaynağı (${adapterCount} Adet)`, price: adapterCost });
          }
        }
      }

      // --- 2. AREA BASED ---
      const isAreaBased = ['lightbox', 'vinilBaski', 'dijitalBaski'].includes(sectionId);
      if (isAreaBased) {
        const wField = sectionId === 'lightbox' ? 'lb_width' : sectionId === 'vinilBaski' ? 'vb_width' : 'db_width';
        const hField = sectionId === 'lightbox' ? 'lb_height' : sectionId === 'vinilBaski' ? 'vb_height' : 'db_height';
        const materialField = sectionId === 'lightbox' ? 'lb_material_id' :
          sectionId === 'vinilBaski' ? 'vb_material_id' : 'db_material_id';

        const w = (parseFloat(form[wField]) || 0) / 100;
        const h = (parseFloat(form[hField]) || 0) / 100;
        const area = w * h;
        const materialArr = sectionId === 'lightbox' ? 'lightbox' : sectionId === 'vinilBaski' ? 'vinil' : 'digital';
        const material = materials[materialArr]?.find(m => m.id === form[materialField]);

        if (area > 0 && material) {
          const price = parsePrice(material.price);
          const cost = area * price;
          itemTotalMaterials += cost;
          globalItems.push({ name: `${labelPrefix}${material.name} (${form[wField]}x${form[hField]}cm)`, price: cost });
        }

        const frameMaterial = materials.frame?.find(m => m.id === form.demirKasaId);
        if (frameMaterial) {
          const dkL = parseFloat(form.dkL) || 0;
          const dkW = parseFloat(form.dkW) || 0;
          const dkAreaM2 = (dkL / 100) * (dkW / 100);
          const dkCost = dkAreaM2 * parsePrice(frameMaterial.price);
          itemTotalMaterials += dkCost;
          if (dkCost > 0) globalItems.push({ name: `${labelPrefix}Demir Kasa: ${frameMaterial.name} (${dkL}x${dkW}cm)`, price: dkCost });
        }
      }

      // --- 3. FENER TABELA ---
      if (sectionId === 'fenerTabela') {
        const material = materials.fener?.find(m => m.id === form.ft_material_id);
        if (material) {
          const price = parsePrice(material.price);
          itemTotalMaterials += price;
          globalItems.push({ name: `${labelPrefix}${material.name}`, price: price });
        }
        const movement = materials.fener_movement?.find(m => m.id === form.ft_movement_id);
        if (movement) {
          const price = parsePrice(movement.price);
          if (price > 0) {
            itemTotalMaterials += price;
            globalItems.push({ name: `${labelPrefix}Mekanizma: ${movement.name}`, price: price });
          }
        }

        if (form.ft_color === 'Diğer') {
          const customColorPrice = parsePrice(form.ft_custom_color_price);
          if (customColorPrice > 0) {
            itemTotalMaterials += customColorPrice;
            const colorName = form.ft_custom_color_name || 'Özel Renk';
            globalItems.push({ name: `${labelPrefix}Özel Metal Rengi (${colorName})`, price: customColorPrice });
          }
        }
      }

      // --- 4. EK HİZMETLER ---
      if (sectionId === 'ekHizmetler') {
        const montaj = parsePrice(form.eh_montaj);
        const nakliye = parsePrice(form.eh_nakliye);
        const vinc = materials.vinc?.find(m => m.id === form.eh_vinc_id);
        const vincPrice = parsePrice(vinc?.price);
        
        if (montaj > 0) {
          itemTotalMaterials += montaj;
          globalItems.push({ name: `Montaj Ücreti`, price: montaj });
        }
        if (vincPrice > 0) {
          itemTotalMaterials += vincPrice;
          globalItems.push({ name: vinc?.name || `Vinç Kiralama`, price: vincPrice });
        }
        if (nakliye > 0) {
          itemTotalMaterials += nakliye;
          globalItems.push({ name: `Nakliye Bedeli`, price: nakliye });
        }
      }

      itemTotalMaterials = itemTotalMaterials;
      totalMaterialsAll += itemTotalMaterials;
    });
  });

  totalSatis = totalMaterialsAll;
  totalKdv = totalSatis * (parseFloat(params.taxRate || 20) / 100);
  grandTotal = totalSatis + totalKdv;

  return {
    items: globalItems,
    totalMaterials: totalMaterialsAll,
    totalSatis,
    kdv: totalKdv,
    grandTotal,
    ledCount: globalLedCount
  };
};
