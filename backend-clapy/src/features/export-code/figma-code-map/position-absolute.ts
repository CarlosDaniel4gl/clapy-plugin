import { DeclarationPlain } from 'css-tree';

import { Dict } from '../../sb-serialize-preview/sb-serialize.model';
import { NodeContextWithBorders } from '../code.model';
import { isFlexNode, isGroup, ValidNode } from '../create-ts-compiler/canvas-utils';
import { addStyle } from '../css-gen/css-factories-high';

function applyPositionRelative(styles: Dict<DeclarationPlain>) {
  if (!styles.position) {
    addStyle(styles, 'position', 'relative');
  }
}

export function positionAbsoluteFigmaToCode(
  context: NodeContextWithBorders,
  node: ValidNode,
  styles: Dict<DeclarationPlain>,
) {
  const isFlex = isFlexNode(node);
  const isGrp = isGroup(node);

  if (isFlex && node.layoutMode === 'NONE') {
    applyPositionRelative(styles);
  }

  // If we are here, the group was not skipped. It means the parent is a flex node (frame, instance...) with auto-layout. We must treat the group as a wrapper for position absolute, with scale mode.
  if (isGrp) {
    applyPositionRelative(styles);
    return;
  }

  const { parentNode, parentContext } = context;
  const parentIsGroup = isGroup(parentNode);
  const parentIsAbsolute = parentIsGroup || (isFlexNode(parentNode) && parentNode?.layoutMode === 'NONE');
  const { borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth } = parentContext?.borderWidths || {
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  };
  if (parentIsAbsolute) {
    addStyle(styles, 'position', 'absolute');
    const { horizontal, vertical } = parentIsGroup
      ? ({ horizontal: 'SCALE', vertical: 'SCALE' } as Constraints)
      : node.constraints;
    // STRETCH and SCALE are only applicable with fixed size (disabled on the UI with hug contents)

    // When an element is absolutely positioned in a group (itself within an autolayout frame), we apply the SCALE mode relative to the group. Since x/y are relative to the groupe parent, we adjust x/y to ensure the scale works well.
    const nodeX = parentIsGroup ? node.x - parentNode.x : node.x;
    const left = nodeX - borderLeftWidth;
    // Don't subtract borderLeftWidth, it's already included in nodeX.
    const right = parentNode.width - nodeX - node.width - borderRightWidth;
    const parentWidth = parentNode.width - borderLeftWidth - borderRightWidth;

    let translateX = false;
    if (horizontal === 'MIN') {
      addStyle(styles, 'left', [left, 'px']);
    } else if (horizontal === 'MAX') {
      addStyle(styles, 'right', [right, 'px']);
    } else if (horizontal === 'CENTER') {
      addStyle(styles, 'left', [((left + node.width / 2) / parentWidth) * 100, '%']);
      translateX = true;
    } else if (horizontal === 'STRETCH') {
      addStyle(styles, 'left', [left, 'px']);
      addStyle(styles, 'right', [right, 'px']);
    } else if (horizontal === 'SCALE') {
      addStyle(styles, 'left', [(left / parentWidth) * 100, '%']);
      addStyle(styles, 'right', [(right / parentWidth) * 100, '%']);
    }

    const nodeY = parentIsGroup ? node.y - parentNode.y : node.y;
    const top = nodeY - borderTopWidth;
    // Don't subtract borderTopWidth, it's already included in nodeY.
    const bottom = parentNode.height - nodeY - node.height - borderBottomWidth;
    const parentHeight = parentNode.height - borderTopWidth - borderBottomWidth;
    let translateY = false;

    if (vertical === 'MIN') {
      addStyle(styles, 'top', [top, 'px']);
    } else if (vertical === 'MAX') {
      addStyle(styles, 'bottom', [bottom, 'px']);
    } else if (vertical === 'STRETCH') {
      addStyle(styles, 'top', [top, 'px']);
      addStyle(styles, 'bottom', [bottom, 'px']);
    } else if (vertical === 'CENTER') {
      addStyle(styles, 'top', [((top + node.height / 2) / parentHeight) * 100, '%']);
      translateY = true;
    } else if (vertical === 'SCALE') {
      addStyle(styles, 'top', [(top / parentHeight) * 100, '%']);
      addStyle(styles, 'bottom', [(bottom / parentHeight) * 100, '%']);
    }

    if (translateX && translateY) {
      addStyle(styles, 'transform', 'translate(-50%, -50%)');
    } else if (translateX) {
      addStyle(styles, 'transform', 'translateX(-50%)');
    } else if (translateY) {
      addStyle(styles, 'transform', 'translateY(-50%)');
    }
  }
}