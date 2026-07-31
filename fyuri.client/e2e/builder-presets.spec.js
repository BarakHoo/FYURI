import { expect, test } from '@playwright/test';
import {
  getBuilderPresetId,
  getBuilderUrl,
  parseBuilderSearchParams,
} from '../src/data/builderPresets.js';
import { getComponentQuantity } from '../src/data/builderData.js';

test.describe('builder product presets', () => {
  test('maps API products and reference product names without database ids', () => {
    expect(getBuilderPresetId({ sku: 'PVS-14', id: 42 })).toBe('pvs-14');
    expect(getBuilderPresetId({ name: 'PVS-14 PRO' })).toBe('pvs-14-pro');
    expect(getBuilderPresetId({ name: 'PVS-14 LITE' })).toBe('pvs-14-lite');
    expect(getBuilderPresetId({ sku: 'ANPVS-7', id: 99 })).toBe('pvs-7');
    expect(getBuilderPresetId({ sku: 'BNVD-1431', id: 1 })).toBe('bnvd-1431');
    expect(getBuilderPresetId({ sku: 'BNVD-BARAK', id: 3 })).toBe('bnvd-barak');
    expect(getBuilderPresetId({ sku: 'PVS-31', id: 4 })).toBe('pvs-31');
    expect(getBuilderPresetId({ name: 'Unknown product', id: 2 })).toBeNull();
    expect(getBuilderUrl({ name: 'Unknown product', id: 2 })).toBeNull();
  });

  test('preloads honest baselines for the API binocular systems', () => {
    const expected = [
      ['BNVD-1431', 'housing-argus-bnvd', 'tube-elbit-xlsh', 'eye-standard'],
      ['BNVD - Barak', 'housing-dtnvs', 'tube-elbit-xlsh', 'eye-standard'],
      ['PVS-31', 'housing-dtnvs', 'tube-l3-unfilmed', 'eye-wide'],
    ];

    for (const [name, housing, tube, eyepiece] of expected) {
      const url = new URL(getBuilderUrl({ name }), 'https://fyuri.test');
      const parsed = parseBuilderSearchParams(url.searchParams);
      expect(parsed.deviceType).toBe('binocular');
      expect(parsed.selections).toMatchObject({ housing, tube, eyepiece });
    }
  });

  test('creates a validated, reload-safe deep link', () => {
    const url = new URL(
      getBuilderUrl({ name: 'PVS-14 PRO' }),
      'https://fyuri.test'
    );
    const parsed = parseBuilderSearchParams(url.searchParams);

    expect(url.pathname).toBe('/builder');
    expect(url.searchParams.get('config')).toBe('1');
    expect(parsed.presetId).toBe('pvs-14-pro');
    expect(parsed.deviceType).toBe('monocular');
    expect(parsed.selections).toMatchObject({
      housing: 'housing-mono-ultralight',
      tube: 'tube-l3-unfilmed',
      objective: 'obj-rpo-4x',
      eyepiece: 'eye-wide',
    });
  });

  test('models PVS-7 as a single-tube bi-ocular device', () => {
    const url = new URL(getBuilderUrl('pvs-7'), 'https://fyuri.test');
    const parsed = parseBuilderSearchParams(url.searchParams);

    expect(parsed.deviceType).toBe('biocular');
    expect(parsed.selections.housing).toBe('housing-pvs7');
    expect(parsed.selections.mount).toBe('mount-pvs7-bayonet');
    expect(getComponentQuantity('biocular', 'tube')).toBe(1);
    expect(getComponentQuantity('biocular', 'objective')).toBe(1);
    expect(getComponentQuantity('biocular', 'eyepiece')).toBe(2);
  });

  test('drops tampered or device-incompatible options', () => {
    const params = new URLSearchParams({
      v: '1',
      config: '1',
      device: 'biocular',
      housing: 'housing-pvs14',
      tube: 'not-a-real-tube',
      eyepiece: 'eye-standard',
    });
    const parsed = parseBuilderSearchParams(params);

    expect(parsed.selections.housing).toBeNull();
    expect(parsed.selections.tube).toBeNull();
    expect(parsed.selections.eyepiece).toBe('eye-standard');
  });
});
