import React from 'react';

const SvgMock = React.forwardRef((props, ref) =>
  React.createElement('svg', {...props, ref})
);

SvgMock.displayName = 'SvgMock';

export default SvgMock;
