import { join } from 'path';
import { IApi, IRoute } from '@umijs/types';
import { utils } from 'umi';
import { getContet } from './utils';
import { readFileSync } from 'fs';

const DIR_NAME = 'plugin-core-preset';

const LOADING_ID = 'lins-module-loading';

export default function(api: IApi) {
  api.logger.info('use core-preset plugin');

  api.describe({
    key: 'core',
    config: {
      schema(joi) {
        return joi.object({
          disable: joi.boolean(),
          dictionary: joi.array().items(joi.string()),
          //子模块是否开启loading
          // disableLoading: joi.boolean(),
          loading: joi.any(),
        });
      },
    },
  });

  api.addDepInfo(() => {
    const pkg = require('../package.json');
    console.log(api.pkg);
    return [
      {
        name: '@sensoro/core',
        range:
          api.pkg.dependencies?.['@sensoro/core'] ||
          api.pkg.devDependencies?.['@sensoro/core'] ||
          pkg.peerDependencies['@sensoro/core'],
      },
    ];
  });

  function haveCorePackage() {
    try {
      // require.resolve('@sensoro/core');
      return true;
    } catch (error) {
      console.log(error);
      console.error('umi-plugin-core-preset 需要安装 @sensoro/core 才可运行');
    }
    return false;
  }

  const {
    core = {},
    qiankun = { master: {} },
    dynamicImport,
    publicPath,
  } = api.userConfig;
  const {
    disable,
    dictionary = [],
    // disableLoading = false,
  } = core;

  if (qiankun) {
    if (haveCorePackage() && !disable) {
      if (qiankun.slave) {
        // if (!disableLoading) {
        //   api.addRuntimePlugin(() => `@@/${DIR_NAME}/app-loading-plugin`);
        //   api.onGenerateFiles(() => {
        //     api.writeTmpFile({
        //       path: `${DIR_NAME}/app-loading-plugin.ts`,
        //       content: readFileSync(
        //         join(__dirname, 'app-loading-plugin.ts.tpl'),
        //         'utf-8',
        //       ),
        //     });
        //   });
        // }
        api.onGenerateFiles(() => {
          api.writeTmpFile({
            path: join(DIR_NAME, 'index.tsx'),
            content: getContet(JSON.stringify(dictionary)),
          });
        });

        api.modifyRoutes(routes => {
          return [
            {
              path: '/',
              component: utils.winPath(
                join(api.paths.absTmpPath || '', DIR_NAME, 'index.tsx'),
              ),
              routes,
            },
          ];
        });

        //如果是动态加载
        if (!!dynamicImport && !!publicPath) {
          const trimPath = publicPath.slice(1);
          api.addHTMLHeadScripts(() => {
            return [
              {
                content: `
                if(window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__){
                  window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ += "${trimPath}";
                }
                `,
              },
            ];
          });

          api.addRuntimePlugin(() => `@@/${DIR_NAME}/dynamic-import-plugin`);

          api.onGenerateFiles(() => {
            api.writeTmpFile({
              path: `${DIR_NAME}/dynamic-import-plugin.ts`,
              content: readFileSync(
                join(__dirname, 'dynamic-import-plugin.ts.tpl'),
                'utf-8',
              ),
            });
          });
        }

        if (core.loading === false) {
          api.logger.info('disable loading');
        } else {
          const { loading = {} } = core;
          const {
            url = 'https://lins-cdn.sensoro.com/lins-cdn/assets/lins_loading.gif',
            top = 64,
            zIndex = 999,
            width = 400,
            height = 300,
          } = loading;
          api.addHTMLScripts(() => {
            return [
              {
                content: `
                var existLoading = window.document.querySelector('#${LOADING_ID}');
                if(!!existLoading){
                  window.document.removeChild(existLoading);
                }
                var loading = window.document.createElement('div');
                loading.id = '${LOADING_ID}';
                loading.style.position = 'absolute';
                loading.style.top = '${top}px';
                loading.style.left = '0px';
                loading.style.right = '0px';
                loading.style.bottom = '0px';
                loading.style.zIndex = '${zIndex}';
                loading.style.paddingTop = '170px';
                loading.style.background = 'white';
                loading.style.display = 'flex';
                loading.style.justifyContent = 'center';
                loading.innerHTML = '<img src="${url}" width="${width}" height="${height}" />';
                var object = window.document.body.appendChild(loading);
                `,
              },
            ];
          });
        }
      }
    }
  } else {
    api.logger.warn('该插件只适用于umi-qiankun项目，skip');
  }
}
