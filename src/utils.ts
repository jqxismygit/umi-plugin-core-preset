export function getContet(dictionary: string) {
  return `
import React from 'react';
import { useCoreState, useRequestDictionary, App } from '@sensoro/core';
import { Empty } from '@sensoro/sensoro-design';
import { ConfigProvider } from 'antd';
import locale from 'antd/lib/locale/zh_CN';
const Dictionary: React.FC = ({ keys, children }) => {
  const running = useRequestDictionary(keys);
  return (
    <>
      {running && children}
    </>
  )
}

export default (props) => {
  const {children, ...rest} = props;
  const running = useCoreState();
  React.useEffect(()=>{
    setTimeout(()=>{
      var loading = window.document.querySelector('#lins-module-loading');
      if(!!loading){
        window.document.body.removeChild(loading);
      }      
    }, 500);
  }, []);
  return (
    <>
      {running && (
        <ConfigProvider locale={locale} autoInsertSpaceInButton={false} renderEmpty={() => <Empty />}>
          <Dictionary keys={${dictionary}}>
            <App {...rest}>
              {children}
            </App>
          </Dictionary>
        </ConfigProvider>
      )}
    </>
  );
};
`;
}
