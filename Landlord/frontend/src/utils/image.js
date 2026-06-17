const CLOUDINARY_SEGMENT = '/upload/';

export function transformCloudinaryUrl(url, options = {}) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_SEGMENT)) {
    return url;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  const transforms = [`q_${quality}`, `f_${format}`];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  return url.replace(CLOUDINARY_SEGMENT, `${CLOUDINARY_SEGMENT}${transforms.join(',')}/`);
}

export function buildImageUrl(url, baseUrl = '', options = {}) {
  if (!url) return null;

  const normalized = url.startsWith('http')
    ? url
    : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  return transformCloudinaryUrl(normalized, options);
}
