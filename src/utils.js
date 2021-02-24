import { imagex } from '@volcengine/openapi';

const RegionMap = {
  cn: {
    host: 'imagex.volcengineapi.com',
    region: 'cn-north-1',
  },
  sg: {
    host: 'imagex-ap-singapore-1.volcengineapi.com',
    region: 'ap-singapore-1',
  },
  us: {
    host: 'imagex-us-east-1.volcengineapi.com',
    region: 'us-east-1',
  },
};

function normalizePath(path, stripTrailing) {
  if (path === '\\' || path === '/') {
    return '/';
  }

  const len = path.length;

  if (len <= 1) {
    return path;
  }

  // ensure that win32 namespaces has two leading slashes, so that the path is
  // handled properly by the win32 version of path.parse() after being normalized
  // https://msdn.microsoft.com/library/windows/desktop/aa365247(v=vs.85).aspx#namespaces
  let prefix = '';

  if (len > 4 && path[3] === '\\') {
    // eslint-disable-next-line prefer-destructuring
    const ch = path[2];

    if ((ch === '?' || ch === '.') && path.slice(0, 2) === '\\\\') {
      // eslint-disable-next-line no-param-reassign
      path = path.slice(2);
      prefix = '//';
    }
  }

  const segs = path.split(/[/\\]+/);

  if (stripTrailing !== false && segs[segs.length - 1] === '') {
    segs.pop();
  }

  return prefix + segs.join('/');
}

async function retry(asyncFunction, query = {}, options) {
  const iterator = Array(3).fill('');
  for (const [index] of iterator.entries()) {
    try {
      /* eslint-disable no-await-in-loop */
      const data = await asyncFunction(query);
      return data;
    } catch (e) {
      console.error(`${options.originUrl}: upload failed ${index + 1}: ${e}`);
    }
  }
  console.error(`${options.originUrl}: all retry failed`);
  return null;
}

async function uploadImage(file, options = {}, callback = () => {}) {
  const imagexService = new imagex.ImagexService({
    defaultVersion: '2018-08-01',
    serviceName: 'imagex',
    accessKeyId: options.accessKey,
    secretKey: options.secretKey,
    ...(RegionMap[options.region || 'cn'] || RegionMap.cn),
  });

  try {
    const res = await retry(
      imagexService.UploadImages,
      {
        serviceId: options.serviceId,
        files: [file],
      },
      { originUrl: options.originUrl }
    );
    let url = null;
    const result = res && res.Result ? res.Result.Results || [] : [];
    if (result.length) {
      url = result[0].Uri;
      console.log(`${options.originUrl}: upload success`);
    }
    callback(url);
  } catch (e) {
    console.error(e);
    callback(null);
  }
}

// eslint-disable-next-line import/prefer-default-export
export { normalizePath, uploadImage, retry };
