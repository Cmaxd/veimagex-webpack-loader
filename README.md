## veImageX Webpack Loader

### 安装

```
// use npm
npm install veimagex-webpack-loader --save-dev

// use yarn
yarn add veimagex-webpack-loader --dev
```

使用方法同 [`file-loader`](https://github.com/webpack-contrib/file-loader)，支持 file-loader 的所有参数，主要用于上传失败后的文件处理，新增了用于图片上传和访问的参数

```
{
  loader: 'veimagex-webpack-loader',
  test: /\.(png|jpe?g|gif|svg)$/i,
  options: {
    outputPath: 'static/media',
    name: '[name].[hash:8].[ext]',
    serviceId: '<服务ID>',
    template: '<模板名称>',
    domain: '<域名>',
    params: '<参数数组>', // 如果模板中有url参数则需要指定
    accessKey: '<accessKey>',
    secretKey: '<secretKey>',
    region: 'boe' | 'cn' | 'sg' | 'us' | 'boei18n', // 上传区域
  },
}
```

### 注意

不要对同一个图片文件同时使用 file-loader 和 veimagex-webpack-loader
