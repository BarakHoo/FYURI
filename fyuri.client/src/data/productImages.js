import { resolveAssetUrl } from '../apiConfig';

const curatedImagesBySku = Object.freeze({
  'PVS-14': '/images/catalog/pvs-14-reference.webp',
  'ANPVS-7': '/images/catalog/pvs-7-reference.webp',
  'BNVD-BARAK': '/images/catalog/products/bnvd-barak-v1.webp',
  'THM-JERRY-C-JC5PRO': '/images/catalog/products/jerry-c-ce5-v1.webp',
  'THM-JERRY-CE': '/images/catalog/products/jerry-c-c2-v1.webp',
  'THM-MATE-MAL38': '/images/catalog/products/infiray-mate-mal38-v1.webp',
  'BLD-HSG-PVS14': '/images/catalog/products/pvs-14-housing-v1.webp',
  'BLD-HSG-MONO-UL': '/images/catalog/products/nocturn-talon-housing-v1.webp',
  'BLD-HSG-RNVG': '/images/catalog/products/rnvg-housing-v1.webp',
  'BLD-HSG-ARGUS-BNVD': '/images/catalog/products/argus-mk2-bnvd-housing-v1.webp',
  'BLD-HSG-CHIM-MG': '/images/catalog/products/chimera-magnesium-v1.webp',
  'BLD-HSG-CHIM-PL': '/images/catalog/products/chimera-polymer-v1.webp',
  'BLD-TUBE-ECHO': '/images/catalog/products/photonis-echo-tube-v1.webp',
  'BLD-TUBE-4G': '/images/catalog/products/photonis-4g-tube-v1.webp',
  'BLD-TUBE-ELBIT-GRN': '/images/catalog/products/elbit-gen3-green-tube-v1.webp',
  'BLD-TUBE-ELBIT-XLSH': '/images/catalog/products/elbit-xlsh-tube-v1.webp',
  'BLD-TUBE-L3-UNF': '/images/catalog/products/l3harris-unfilmed-tube-v1.webp',
  'BLD-OBJ-3X': '/images/catalog/products/3x-magnifier-v1.webp',
  'BLD-OBJ-RPO-3': '/images/catalog/products/rpo-pvs14-ultralight-v1.webp',
  'BLD-OBJ-RPO-4': '/images/catalog/products/rpo-nvd-next-4-v1.webp',
  'BLD-EYE-WIDE': '/images/catalog/products/extended-eye-relief-v1.webp',
  'BLD-BAT-ONBOARD': '/images/catalog/products/onboard-battery-v1.webp',
  'BLD-IR-850': '/images/catalog/products/ir-illuminator-850-v1.webp',
});

const curatedImagesByName = Object.freeze({
  'pvs-14': '/images/catalog/pvs-14-reference.webp',
  'pvs-14 pro': '/images/catalog/pvs-14-pro-reference.webp',
  'pvs-14 lite': '/images/catalog/pvs-14-lite-reference.webp',
  'an/pvs-7': '/images/catalog/pvs-7-reference.webp',
  'pvs-7': '/images/catalog/pvs-7-reference.webp',
});

const normalizeSku = (value) => String(value || '').trim().toUpperCase();
const normalizeName = (value) => String(value || '').trim().toLowerCase();
const curatedOnlySkus = new Set(
  Object.keys(curatedImagesBySku).filter((sku) => sku !== 'PVS-14'),
);

export const getCuratedProductImage = (product) => {
  const sku = normalizeSku(product?.sku);
  if (sku) return curatedImagesBySku[sku] || '';
  return curatedImagesByName[normalizeName(product?.name)] || '';
};

export const getProductImageCandidates = (product) => {
  const apiImages = [
    product?.thumbnailUrl,
    ...(Array.isArray(product?.imageUrls) ? product.imageUrls : []),
  ]
    .filter((path) => typeof path === 'string' && path.trim())
    .map((path) => resolveAssetUrl(path.trim()));

  return [...new Set([
    getCuratedProductImage(product),
    ...apiImages,
  ].filter(Boolean))];
};

export const getProductGalleryImages = (product) => {
  const curatedImage = getCuratedProductImage(product);
  if (curatedImage && curatedOnlySkus.has(normalizeSku(product?.sku))) {
    return [curatedImage];
  }

  return getProductImageCandidates(product);
};
