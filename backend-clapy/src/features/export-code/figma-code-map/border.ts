import { DeclarationPlain } from 'css-tree';

import { Dict } from '../../sb-serialize-preview/sb-serialize.model';
import { NodeContext, NodeContextWithBorders } from '../code.model';
import { FlexOrTextNode, isText } from '../create-ts-compiler/canvas-utils';
import { addStyle } from '../css-gen/css-factories-high';
import { figmaColorToCssRGBA, tagResets, warnNode } from './details/utils-and-reset';

export function borderFigmaToCode(
  context: NodeContext,
  node: FlexOrTextNode,
  styles: Dict<DeclarationPlain>,
): NodeContextWithBorders {
  if (isText(node)) {
    // stroke has a different meaning on text. We will handle it later.
    warnNode(node, 'TODO Unsupported stroke on text');
    return {
      ...context,
      borderWidths: {
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
      },
    };
  }

  const visibleStrokes = (node.strokes || []).filter(({ visible }) => visible);
  if (visibleStrokes.length) {
    if (visibleStrokes.length > 1) {
      warnNode(node, 'TODO Unsupported multiple borders, will only apply the first');
    }
    const stroke = visibleStrokes[0];
    if (stroke.type === 'SOLID') {
      // stroke.blendMode
      // node.{strokeCap, strokeGeometry, strokeJoin, strokeMiterLimit}
      const { color, opacity } = stroke;
      const { strokeAlign, strokeWeight } = node;
      if (strokeAlign !== 'INSIDE') {
        warnNode(
          node,
          `TODO unsupported strokeAlign ${strokeAlign}, it is treated as INSIDE. Do we want to support it? Should we outline instead?`,
        );
      }
      const borderWidth = strokeWeight;
      const hex = figmaColorToCssRGBA(color, opacity);
      addStyle(styles, 'border', 'solid', [borderWidth, 'px'], hex);
      return {
        ...context,
        borderWidths: {
          borderTopWidth: borderWidth,
          borderRightWidth: borderWidth,
          borderBottomWidth: borderWidth,
          borderLeftWidth: borderWidth,
        },
      };
    } else {
      warnNode(node, 'TODO Unsupported non solid border');
    }
  }

  // If no border applied, check if a reset is required
  if (tagResets[context.tagName]?.border) {
    addStyle(styles, 'border', 'none');
  }
  return {
    ...context,
    borderWidths: {
      borderTopWidth: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderLeftWidth: 0,
    },
  };
}