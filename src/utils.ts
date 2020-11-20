export function getContet(dictionary: string) {
  return `
import React from 'react';
import { useCoreState, useRequestDictionary, App } from '@sensoro/core';


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
  return (
    <>
      {running && (
        <Dictionary keys={${dictionary}}>
          <App {...rest}>
            {children}
          </App>
        </Dictionary>
      )}
    </>
  );
};
`;
}
