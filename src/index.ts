import { join } from 'path';
import { IApi } from '@umijs/types';
import { utils } from 'umi';
import { getContet } from './utils';

const DIR_NAME = 'plugin-core-preset';

export default function(api: IApi) {
  api.logger.info('use core-preset plugin');

  api.describe({
    key: 'core',
    config: {
      schema(joi) {
        return joi.object({
          disable: joi.boolean(),
          dictionary: joi.array().items(joi.string()),
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

  const { core = {}, qiankun = { master: {} } } = api.userConfig;
  const { disable, dictionary = [] } = core;

  console.log(dictionary);

  if (qiankun) {
    if (haveCorePackage() && !disable) {
      if (qiankun.slave) {
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
      }
    }
  } else {
    api.logger.warn('该插件只适用于umi-qiankun项目，skip');
  }
}
