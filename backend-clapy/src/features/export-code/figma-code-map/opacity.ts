import { DeclarationPlain } from 'css-tree';

import { Dict } from '../../sb-serialize-preview/sb-serialize.model';
import { NodeContext } from '../code.model';
import { FlexOrTextNode } from '../create-ts-compiler/canvas-utils';
import { addStyle } from '../css-gen/css-factories-high';

export function opacityFigmaToCode(context: NodeContext, node: FlexOrTextNode, styles: Dict<DeclarationPlain>) {
  if (node.opacity !== 1) {
    addStyle(styles, 'opacity', node.opacity);
  }
}