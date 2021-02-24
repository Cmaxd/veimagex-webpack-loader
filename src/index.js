import path from 'path';

import { getOptions, interpolateName } from 'loader-utils';

import { normalizePath, uploadImage } from './utils';

export default function loader(content) {
  const options = getOptions(this) || {};
  const callback = this.async();
  const that = this;
  const esModule =
    typeof options.esModule !== 'undefined' ? options.esModule : true;

  const originUrl = interpolateName(that, '[name].[ext]', {
    context: options.context || this.rootContext,
  });

  uploadImage(content, { ...options, originUrl }, function (imagexUri) {
    let result = '';
    if (imagexUri && options.domain && options.template) {
      const urlParams = (options.params || [])
        .map((item) => `:${item}`)
        .join('');
      let formatDomain = options.domain.replace(/^https?:\/\//i, '');
      formatDomain = formatDomain.endsWith('/')
        ? formatDomain
        : `${formatDomain}/`;
      result = `${
        esModule ? 'export default' : 'module.exports ='
      } "//${formatDomain}${imagexUri}~${options.template}${urlParams}.image";`;
    } else {
      const context = options.context || that.rootContext;
      const name = options.name || '[contenthash].[ext]';

      const url = interpolateName(that, name, {
        context,
        content,
        regExp: options.regExp,
      });

      let outputPath = url;
      if (options.outputPath) {
        if (typeof options.outputPath === 'function') {
          outputPath = options.outputPath(url, that.resourcePath, context);
        } else {
          outputPath = path.posix.join(options.outputPath, url);
        }
      }
      let publicPath = `__webpack_public_path__ + ${JSON.stringify(
        outputPath
      )}`;
      if (options.publicPath) {
        if (typeof options.publicPath === 'function') {
          publicPath = options.publicPath(url, that.resourcePath, context);
        } else {
          publicPath = `${
            options.publicPath.endsWith('/')
              ? options.publicPath
              : `${options.publicPath}/`
          }${url}`;
        }

        publicPath = JSON.stringify(publicPath);
      }

      if (options.postTransformPublicPath) {
        publicPath = options.postTransformPublicPath(publicPath);
      }

      if (typeof options.emitFile === 'undefined' || options.emitFile) {
        const assetInfo = {};

        if (typeof name === 'string') {
          let normalizedName = name;

          const idx = normalizedName.indexOf('?');

          if (idx >= 0) {
            normalizedName = normalizedName.substr(0, idx);
          }

          const isImmutable = /\[([^:\]]+:)?(hash|contenthash)(:[^\]]+)?]/gi.test(
            normalizedName
          );

          if (isImmutable === true) {
            assetInfo.immutable = true;
          }
        }
        assetInfo.sourceFilename = normalizePath(
          path.relative(that.rootContext, that.resourcePath)
        );
        that.emitFile(outputPath, content, null, assetInfo);
      }

      result = `${
        esModule ? 'export default' : 'module.exports ='
      } ${publicPath};`;
    }
    callback(null, result);
  });
}

export const raw = true;
