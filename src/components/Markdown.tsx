'use client';

import React from 'react';
import { getMDXComponent } from 'mdx-bundler/client';

const Markdown: React.FC<{ code: string }> = ({ code }) => {
  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  return <Component />;
};

export default Markdown;
