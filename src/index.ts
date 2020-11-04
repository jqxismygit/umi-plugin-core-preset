import { join } from 'path';
import { IApi } from '@umijs/types';
import { utils } from 'umi';
const DIR_NAME = 'plugin-core-preset';

const CorePresetSlaveContent = `
import React from 'react';
import { useCoreState } from '@sensoro/core';

export default (props) => {
  const {children} = props;
  const running = useCoreState();
  return (
    <>
      {running && children}
    </>
  );
};
`;

export default function(api: IApi) {
  api.logger.info('use core-preset plugin');

  api.describe({
    key: 'core',
    config: {
      schema(joi) {
        return joi.object({
          disable: joi.boolean(),
        });
      },
    },
  });

  function haveCorePackage() {
    try {
      require.resolve('@sensoro/core');
      return true;
    } catch (error) {
      console.log(error);
      console.error('umi-plugin-core-preset 需要安装 @sensoro/core 才可运行');
    }
    return false;
  }

  const { core = {}, qiankun = { master: {} } } = api.userConfig;
  const { disable } = core;
  if (qiankun) {
    if (haveCorePackage() && !disable) {
      if (qiankun.slave) {
        api.onGenerateFiles(() => {
          api.writeTmpFile({
            path: join(DIR_NAME, 'index.tsx'),
            content: CorePresetSlaveContent,
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
