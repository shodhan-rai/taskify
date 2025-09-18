// Type declarations for JSX modules
declare module '*.jsx' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module '*.js' {
  const content: any;
  export default content;
  export * from content;
}