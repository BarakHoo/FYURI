import {
  builderCategories,
  DEFAULT_DEVICE_TYPE,
  deviceTypes,
  getDefaultSelections,
  getOptionsForDevice,
} from './builderData.js';

export const BUILDER_QUERY_VERSION = '1';

export const builderPresets = {
  'pvs-14': {
    id: 'pvs-14',
    nameEn: 'PVS-14',
    nameHe: 'PVS-14',
    deviceType: 'monocular',
    selections: {
      housing: 'housing-pvs14',
      tube: 'tube-elbit-green',
      objective: 'obj-1x',
      eyepiece: 'eye-standard',
      battery: 'bat-onboard',
      mount: 'mount-dovetail-only',
      illuminator: 'ir-none',
    },
  },
  'pvs-14-pro': {
    id: 'pvs-14-pro',
    nameEn: 'PVS-14 PRO',
    nameHe: 'PVS-14 PRO',
    deviceType: 'monocular',
    selections: {
      housing: 'housing-mono-ultralight',
      tube: 'tube-l3-unfilmed',
      objective: 'obj-rpo-4x',
      eyepiece: 'eye-wide',
      battery: 'bat-onboard',
      mount: 'mount-dovetail-only',
      illuminator: 'ir-none',
    },
  },
  'pvs-14-lite': {
    id: 'pvs-14-lite',
    nameEn: 'PVS-14 LITE',
    nameHe: 'PVS-14 LITE',
    deviceType: 'monocular',
    selections: {
      housing: 'housing-mono-ultralight',
      tube: 'tube-photonis-echo',
      objective: 'obj-1x',
      eyepiece: 'eye-standard',
      battery: 'bat-onboard',
      mount: 'mount-dovetail-only',
      illuminator: 'ir-none',
    },
  },
  'pvs-7': {
    id: 'pvs-7',
    nameEn: 'PVS-7',
    nameHe: 'PVS-7',
    deviceType: 'biocular',
    selections: {
      housing: 'housing-pvs7',
      tube: 'tube-elbit-green',
      objective: 'obj-1x',
      eyepiece: 'eye-standard',
      battery: 'bat-onboard',
      mount: 'mount-pvs7-bayonet',
      illuminator: 'ir-none',
    },
  },
  'bnvd-1431': {
    id: 'bnvd-1431',
    nameEn: 'BNVD-1431',
    nameHe: 'BNVD-1431',
    deviceType: 'binocular',
    selections: {
      housing: 'housing-argus-bnvd',
      tube: 'tube-elbit-xlsh',
      objective: 'obj-1x',
      eyepiece: 'eye-standard',
      battery: 'bat-onboard',
      mount: 'mount-dovetail-only',
      illuminator: 'ir-none',
    },
  },
  'bnvd-barak': {
    id: 'bnvd-barak',
    nameEn: 'BNVD - Barak',
    nameHe: 'BNVD - ברק',
    deviceType: 'binocular',
    selections: {
      housing: 'housing-dtnvs',
      tube: 'tube-elbit-xlsh',
      objective: 'obj-1x',
      eyepiece: 'eye-standard',
      battery: 'bat-onboard',
      mount: 'mount-dovetail-only',
      illuminator: 'ir-none',
    },
  },
  'pvs-31': {
    id: 'pvs-31',
    nameEn: 'PVS-31',
    nameHe: 'PVS-31',
    deviceType: 'binocular',
    selections: {
      housing: 'housing-dtnvs',
      tube: 'tube-l3-unfilmed',
      objective: 'obj-1x',
      eyepiece: 'eye-wide',
      battery: 'bat-onboard',
      mount: 'mount-dovetail-only',
      illuminator: 'ir-none',
    },
  },
};

const presetAliases = {
  pvs14: 'pvs-14',
  pvs14pro: 'pvs-14-pro',
  pvs14lite: 'pvs-14-lite',
  pvs7: 'pvs-7',
  anpvs7: 'pvs-7',
  bnvd1431: 'bnvd-1431',
  bnvdbarak: 'bnvd-barak',
  pvs31: 'pvs-31',
};

const normalizeProductKey = (value) =>
  typeof value === 'string'
    ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
    : '';

const validDeviceTypes = new Set(deviceTypes.map((device) => device.id));

export function getBuilderPresetId(product) {
  if (!product) return null;

  if (typeof product === 'string') {
    if (builderPresets[product]) return product;
    return presetAliases[normalizeProductKey(product)] ?? null;
  }

  const explicitPreset = product.builderPresetId || product.builderPreset;
  if (explicitPreset && builderPresets[explicitPreset]) return explicitPreset;

  const candidates = [
    product.slug,
    typeof product.id === 'string' ? product.id : null,
    product.sku,
    product.name,
    product.nameEn,
  ];

  for (const candidate of candidates) {
    const presetId = presetAliases[normalizeProductKey(candidate)];
    if (presetId) return presetId;
  }

  return null;
}

export function validateBuilderSelections(deviceType, candidateSelections = {}) {
  const selections = getDefaultSelections();
  if (!validDeviceTypes.has(deviceType)) return selections;

  for (const category of builderCategories) {
    const optionId = candidateSelections[category.id];
    if (!optionId) continue;

    const valid = getOptionsForDevice(category, deviceType)
      .some((option) => option.id === optionId);
    if (valid) selections[category.id] = optionId;
  }

  return selections;
}

export function serializeBuilderConfiguration({
  deviceType = DEFAULT_DEVICE_TYPE,
  selections = {},
  presetId = null,
} = {}) {
  const safeDeviceType = validDeviceTypes.has(deviceType)
    ? deviceType
    : DEFAULT_DEVICE_TYPE;
  const safeSelections = validateBuilderSelections(safeDeviceType, selections);
  const params = new URLSearchParams();

  params.set('v', BUILDER_QUERY_VERSION);
  params.set('config', '1');
  if (presetId && builderPresets[presetId]) params.set('preset', presetId);
  params.set('device', safeDeviceType);

  for (const category of builderCategories) {
    const optionId = safeSelections[category.id];
    if (optionId) params.set(category.id, optionId);
  }

  return params;
}

export function parseBuilderSearchParams(value) {
  const params = value instanceof URLSearchParams
    ? value
    : new URLSearchParams(value || '');
  const requestedPreset = params.get('preset');
  const presetId = requestedPreset && builderPresets[requestedPreset]
    ? requestedPreset
    : null;
  const preset = presetId ? builderPresets[presetId] : null;
  const requestedDeviceType = params.get('device');
  const deviceType = validDeviceTypes.has(requestedDeviceType)
    ? requestedDeviceType
    : preset?.deviceType ?? DEFAULT_DEVICE_TYPE;
  const hasExplicitConfiguration = params.get('config') === '1'
    || builderCategories.some((category) => params.has(category.id));
  const candidateSelections = hasExplicitConfiguration
    ? Object.fromEntries(
      builderCategories.map((category) => [category.id, params.get(category.id)])
    )
    : preset?.selections ?? {};

  return {
    version: params.get('v') || BUILDER_QUERY_VERSION,
    presetId,
    preset,
    deviceType,
    selections: validateBuilderSelections(deviceType, candidateSelections),
  };
}

export function getBuilderUrl(product) {
  const presetId = getBuilderPresetId(product);
  if (!presetId) return null;

  const preset = builderPresets[presetId];
  const params = serializeBuilderConfiguration({
    deviceType: preset.deviceType,
    selections: preset.selections,
    presetId,
  });

  return `/builder?${params.toString()}`;
}
