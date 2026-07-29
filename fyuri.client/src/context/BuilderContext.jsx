import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  builderCategories,
  getDefaultSelections,
  getOptionsForDevice,
  getTubeCount,
  DEFAULT_DEVICE_TYPE,
} from '../data/builderData';

const BuilderContext = createContext();

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within BuilderProvider');
  }
  return context;
};

export const BuilderProvider = ({ children }) => {
  const [selections, setSelections] = useState(getDefaultSelections);
  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [deviceType, setDeviceTypeState] = useState(DEFAULT_DEVICE_TYPE);

  // Changing form factor clears selections that don't fit the new device type
  const setDeviceType = useCallback((newType) => {
    setDeviceTypeState(newType);
    setSelections((prev) => {
      const next = { ...prev };
      for (const category of builderCategories) {
        const optionId = next[category.id];
        if (!optionId) continue;
        const valid = getOptionsForDevice(category, newType).some((o) => o.id === optionId);
        if (!valid) next[category.id] = null;
      }
      return next;
    });
  }, []);

  const selectOption = useCallback((categoryId, optionId) => {
    setSelections((prev) => ({ ...prev, [categoryId]: optionId }));
  }, []);

  const resetBuild = useCallback(() => {
    setSelections(getDefaultSelections());
    setActiveCategory(null);
    setDeviceTypeState(DEFAULT_DEVICE_TYPE);
  }, []);

  const summary = useMemo(() => {
    let totalPrice = 0;
    let totalWeight = 0;
    const selectedParts = [];
    let allAvailable = true;
    const tubeCount = getTubeCount(deviceType);

    for (const category of builderCategories) {
      const optionId = selections[category.id];
      if (!optionId) continue;
      const option = category.options.find((o) => o.id === optionId);
      if (!option) continue;
      // Per-channel parts (tubes, lenses) multiply by the number of channels
      const qty = category.perChannel ? tubeCount : 1;
      totalPrice += option.price * qty;
      totalWeight += option.weightGrams * qty;
      if (!option.available) allAvailable = false;
      selectedParts.push({ category, option, quantity: qty });
    }

    // Required categories (housing, tubes) must be selected for checkout
    const missingRequired = builderCategories.filter(
      (category) =>
        category.required &&
        getOptionsForDevice(category, deviceType).length > 0 &&
        !selections[category.id]
    );

    return { totalPrice, totalWeight, selectedParts, allAvailable, missingRequired, tubeCount };
  }, [selections, deviceType]);

  return (
    <BuilderContext.Provider
      value={{
        selections,
        selectOption,
        resetBuild,
        activeCategory,
        setActiveCategory,
        hoveredCategory,
        setHoveredCategory,
        deviceType,
        setDeviceType,
        summary,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};
