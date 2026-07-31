import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import {
  builderCategories,
  getDefaultSelections,
  getOptionsForDevice,
  getComponentQuantity,
  DEFAULT_DEVICE_TYPE,
} from '../data/builderData';
import {
  parseBuilderSearchParams,
  serializeBuilderConfiguration,
} from '../data/builderPresets';

const BuilderContext = createContext();

// Context hooks intentionally live beside their provider for a single public API.
// eslint-disable-next-line react-refresh/only-export-components
export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within BuilderProvider');
  }
  return context;
};

export const BuilderProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const parsedConfiguration = useMemo(
    () => parseBuilderSearchParams(searchParams),
    [searchParams]
  );
  const {
    deviceType = DEFAULT_DEVICE_TYPE,
    selections = getDefaultSelections(),
    presetId,
    preset: sourcePreset,
  } = parsedConfiguration;

  const setDeviceType = useCallback((newType) => {
    const nextPresetId = sourcePreset?.deviceType === newType ? presetId : null;
    setSearchParams(
      serializeBuilderConfiguration({
        deviceType: newType,
        selections,
        presetId: nextPresetId,
      }),
      { replace: true }
    );
  }, [presetId, selections, setSearchParams, sourcePreset]);

  const selectOption = useCallback((categoryId, optionId) => {
    if (!builderCategories.some((category) => category.id === categoryId)) return;
    setSearchParams(
      serializeBuilderConfiguration({
        deviceType,
        selections: { ...selections, [categoryId]: optionId },
        presetId,
      }),
      { replace: true }
    );
  }, [deviceType, presetId, selections, setSearchParams]);

  const resetBuild = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setActiveCategory(null);
  }, [setSearchParams]);

  const summary = useMemo(() => {
    let totalPrice = 0;
    let totalWeight = 0;
    const selectedParts = [];
    let allAvailable = true;

    for (const category of builderCategories) {
      const optionId = selections[category.id];
      if (!optionId) continue;
      const option = category.options.find((o) => o.id === optionId);
      if (!option) continue;
      const qty = getComponentQuantity(deviceType, category.id);
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

    const tubeCount = getComponentQuantity(deviceType, 'tube');
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
        presetId,
        sourcePreset,
        summary,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};
