import type { DeclarationPlain, RulePlain } from 'css-tree';
import type { Node, Statement } from 'typescript';
import ts from 'typescript';

import { flags } from '../../../env-and-config/app-config.js';
import { env } from '../../../env-and-config/env.js';
import { warnOrThrow } from '../../../utils.js';
import { nodeDefaults, type ExtraConfig, type SceneNodeNoMethod } from '../../sb-serialize-preview/sb-serialize.model.js';
import type {
  BaseOnClickOverrie,
  BaseStyleOverride,
  CompContext,
  FigmaOverride,
  InstanceContext,
  JsxOneOrMore,
  ModuleContext,
  NodeContext,
  OnClickOverrie,
  StyleOverride,
} from '../code.model.js';
import type { RulePlainExtended, SceneNode2 } from '../create-ts-compiler/canvas-utils.js';
import { isInstance } from '../create-ts-compiler/canvas-utils.js';
import { mkSelectorsWithBem, shouldIncreaseSpecificity } from '../css-gen/css-factories-high.js';
import {
  cssAstToString,
  mkBlockCss,
  mkRawCss,
  mkRuleCss,
  mkSelectorCss,
  mkSelectorListCss,
} from '../css-gen/css-factories-low.js';
import { useBem } from './process-nodes-utils.js';
import { warnNode } from './utils-and-reset.js';

const { factory } = ts;

export function addCssRule(
  context: NodeContext,
  className: string | false,
  styleDeclarations: DeclarationPlain[],
  node: SceneNode2,
  options?: {
    skipAssignRule?: boolean;
    customSelector?: string;
    reuseClassName?: boolean;
    parentRule?: RulePlainExtended | null; // Provide an explicit null to indicate there is no parent without defaulting to node.rule.
  },
) {
  let { skipAssignRule, customSelector, reuseClassName, parentRule } = options || {};
  const bem = useBem(context);
  const increaseSpecificity = shouldIncreaseSpecificity(context);
  const providedAParentRule = parentRule !== undefined; // null counts as a provided parentRule
  if (!providedAParentRule) {
    parentRule = node.rule;
  } else if (parentRule === null) {
    parentRule = undefined; // replace null with undefined, more convenient for typings in the usage below
  }

  const { cssRules } = context.moduleContext;
  const selectors = mkSelectorsWithBem(context, className, parentRule, customSelector, reuseClassName);
  const block = mkBlockCss(styleDeclarations);
  let cssRule: RulePlain;
  if (bem && increaseSpecificity && className) {
    // Doubled selector for specificity with scss: https://stackoverflow.com/a/47781599/4053349
    const sel = mkSelectorListCss([mkSelectorCss([mkRawCss('&#{&}')])]);
    const ruleAsStr = cssAstToString(mkRuleCss(sel, block));
    cssRule = mkRuleCss(selectors, mkBlockCss([mkRawCss(ruleAsStr)]));
  } else {
    cssRule = mkRuleCss(selectors, block);
  }
  if (bem && parentRule) {
    bindRuleToParent(parentRule, cssRule);
  } else {
    cssRules.push(cssRule);
  }
  if (bem && !skipAssignRule && !providedAParentRule) {
    node.rule = cssRule;
  }
  return cssRule;
}

export function bindRuleToParent(parentRule: RulePlainExtended, cssRule: RulePlain) {
  if (!parentRule.childRules) parentRule.childRules = [];
  parentRule.childRules.push(cssRule);
  // If the tree should be the other way around (link to parent instead of children):
  (cssRule as RulePlainExtended).parentRule = parentRule;
}

export function updateCssRule(
  context: NodeContext,
  cssRule: RulePlain,
  className: string,
  parentRule: RulePlainExtended | undefined,
  styleDeclarations: DeclarationPlain[],
) {
  const bem = useBem(context);
  const increaseSpecificity = shouldIncreaseSpecificity(context);

  cssRule.prelude = mkSelectorsWithBem(context, className, parentRule);
  context.selector = cssAstToString(cssRule.prelude);

  if (bem && increaseSpecificity) {
    // if the CSS selector specificity should be increased, the selector is repeated `overrideDepth` times,
    // using a SCSS hack to repeat the '&' special character: https://stackoverflow.com/a/47781599/4053349
    // (hack for overrides when using CSS modules)
    let overrideDepth = context.notOverridingAnotherClass ? 1 : (context as InstanceContext).intermediateNodes?.length;
    const sel = mkSelectorListCss([
      mkSelectorCss([
        mkRawCss(
          `&${Array(overrideDepth - 1)
            .fill('#{&}')
            .join('')}`,
        ),
      ]),
    ]);
    const block = mkBlockCss(styleDeclarations);
    const ruleAsStr = cssAstToString(mkRuleCss(sel, block));
    cssRule.block.children.push(mkRawCss(ruleAsStr));
  } else {
    cssRule.block.children.push(...styleDeclarations);
  }
}

export function removeCssRule(context: NodeContext, cssRule: RulePlain, node: SceneNodeNoMethod) {
  const { cssRules } = context.moduleContext;
  const i = cssRules.indexOf(cssRule);
  if (i === -1) {
    warnNode(node, 'Trying to remove CSS rule but it is not found in its parent:', JSON.stringify(cssRule));
    return;
  }
  cssRules.splice(i, 1);
}

export function fillIsRootInComponent(moduleContext: ModuleContext, node: SceneNode2) {
  // It may be equivalent to `isComponent(node)`, but for safety, I keep the legacy test. We can refactor later, and test when the app is stable.
  node.isRootInComponent = node === moduleContext.node;
}

export function mkHtmlFullClass(context: NodeContext, className: string, parentClassName?: string) {
  // If following the BEM conventions, the HTML class name includes the parent class name.
  // So mkHtmlFullClass needs to be called in the right order, from parent to child.
  const bem = useBem(context);
  return bem && parentClassName ? `${parentClassName}__${className || ''}` : className || '';
}

export function getOrCreateCompContext(node: SceneNode2) {
  if (!node) throw new Error('Calling getOrCreateCompContext on an undefined node.');
  if (!node._context) {
    node._context = {
      instanceStyleOverrides: {},
      instanceHidings: {},
      instanceSwaps: {},
      instanceTextOverrides: {},
      instanceOnClickOverrides: {},
    };
  }
  return node._context;
}

export function checkIsOriginalInstance(node: SceneNode2, nextNode: SceneNode2 | undefined) {
  if (!node) {
    throw new Error(`BUG [checkIsOriginalInstance] node is undefined.`);
  }
  if (!nextNode) {
    throw new Error(`BUG [checkIsOriginalInstance] nextNode is undefined.`);
  }
  const nodeIsInstance = isInstance(node);
  const nextNodeIsInstance = isInstance(nextNode);
  if (nodeIsInstance !== nextNodeIsInstance) {
    throw new Error(
      `BUG nodeIsInstance: ${nodeIsInstance} but nextNodeIsInstance: ${nextNodeIsInstance}, althought they are supposed to be the same.`,
    );
  }
  return !nodeIsInstance || !nextNodeIsInstance || node.mainComponent!.id === nextNode.mainComponent!.id; // = not swapped in Figma
}

export function createClassAttrForNode(node: SceneNode2, extraConfig: ExtraConfig, className?: string) {
  const className2 = className || node.className;
  const overrideEntry: BaseStyleOverride = {
    overrideValue: className2,
    propValue: node.classOverride ? node.className : undefined,
  };
  return mkClassAttr2(overrideEntry, extraConfig);
}

export function createClassAttrForClassNoOverride(className: string | undefined, extraConfig: ExtraConfig) {
  const overrideEntry: BaseStyleOverride = { overrideValue: className };
  return mkClassAttr2(overrideEntry, extraConfig);
}

// AST generation functions

export function mkSimpleImportDeclaration(moduleSpecifier: string) {
  return factory.createImportDeclaration(
    undefined,
    undefined,
    undefined,
    factory.createStringLiteral(moduleSpecifier),
    undefined,
  );
}

export function mkDefaultImportDeclaration(importClauseName: string, moduleSpecifier: string) {
  return factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(false, factory.createIdentifier(importClauseName), undefined),
    factory.createStringLiteral(moduleSpecifier),
    undefined,
  );
}

export function mkNamedImportsDeclaration(
  importSpecifierNames: (string | [string, string])[],
  moduleSpecifier: string,
  isTypeOnly?: boolean,
) {
  return factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(
      !!isTypeOnly,
      undefined,
      factory.createNamedImports(
        importSpecifierNames.map(name =>
          typeof name === 'string'
            ? factory.createImportSpecifier(false, undefined, factory.createIdentifier(name))
            : factory.createImportSpecifier(
              false,
              factory.createIdentifier(name[0]),
              factory.createIdentifier(name[1]),
            ),
        ),
      ),
    ),
    factory.createStringLiteral(moduleSpecifier),
    undefined,
  );
}

export function mkPropInterface(moduleContext: ModuleContext) {
  const { classOverrides, swaps, hideProps, textOverrideProps, compName, hasOnClick, onClickOverrideProps } = moduleContext;
  const classes = Array.from(classOverrides);
  const swapsArr = Array.from(swaps);
  const hidePropNames = Array.from(hideProps);
  const textOverridePropNames = Array.from(textOverrideProps);
  const isScreen = compName.includes('Screen')
  const isList = compName.includes('List')
  return factory.createInterfaceDeclaration(
    undefined,
    undefined,
    factory.createIdentifier(`${compName}Props`),
    undefined,
    undefined,
    [
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier('className'),
        factory.createToken(ts.SyntaxKind.QuestionToken),
        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
      ),
      ...(!classes?.length
        ? []
        : [
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier('classes'),
            factory.createToken(ts.SyntaxKind.QuestionToken),
            factory.createTypeLiteralNode(
              classes.map(classOverride =>
                factory.createPropertySignature(
                  undefined,
                  factory.createIdentifier(classOverride),
                  factory.createToken(ts.SyntaxKind.QuestionToken),
                  factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ),
              ),
            ),
          ),
        ]),
      ...(!swapsArr?.length
        ? []
        : [
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier('swap'),
            factory.createToken(ts.SyntaxKind.QuestionToken),
            factory.createTypeLiteralNode(
              swapsArr.map(swap =>
                factory.createPropertySignature(
                  undefined,
                  factory.createIdentifier(swap),
                  factory.createToken(ts.SyntaxKind.QuestionToken),
                  factory.createTypeReferenceNode(factory.createIdentifier('ReactNode'), undefined),
                ),
              ),
            ),
          ),
        ]),
      ...(hidePropNames?.length ? [
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier('hide'),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          factory.createTypeLiteralNode(
            hidePropNames.map(name =>
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier(name),
                factory.createToken(ts.SyntaxKind.QuestionToken),
                factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
              ),
            ),
          ),
        ),
      ] : []),
      ...(textOverridePropNames?.length ? [
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier('text'),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          factory.createTypeLiteralNode(
            textOverridePropNames.map(name =>
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier(name),
                factory.createToken(ts.SyntaxKind.QuestionToken),
                factory.createTypeReferenceNode(factory.createIdentifier('ReactNode'), undefined),
              ),
            ),
          ),
        ),
      ] : []),
      ...(Array.from(onClickOverrideProps).length > 0 ? [
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier('clicks'),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          factory.createTypeLiteralNode(
            Array.from(onClickOverrideProps).map(name =>
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier(name),
                factory.createToken(ts.SyntaxKind.QuestionToken),
                factory.createFunctionTypeNode(
                  undefined, // No type parameters
                  [], // Empty parameters (indicates `()`)
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword) // Return type `void`
                )
              ),
            ),
          ),
        ),
      ] : []),
      ...(isList ? [
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier('array'),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          ts.factory.createArrayTypeNode(
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword) // Type 'any'
          ),
        ),
      ] : []),
    ],
  );
}

function jsxOneOrMoreToJsxExpression(tsx: JsxOneOrMore | ts.Expression | undefined) {
  if (tsx) {
    if (Array.isArray(tsx)) {
      return mkFragment(tsx);
    } else if (ts.isJsxText(tsx)) {
      return mkFragment([tsx]);
    } else {
      return tsx;
    }
  } else {
    return ts.factory.createNull();
  }
}

export function mkCompFunction(
  moduleContext: ModuleContext,
  fnName: string,
  tsx: JsxOneOrMore | undefined,
  prefixStatements: Statement[] = [],
  skipAnnotation?: boolean,
) {
  const { classOverrides, compName, textOverrideProps, onClickOverrideProps, hasOnClick, hideProps, swaps } = moduleContext;
  const textOverridePropNames = Array.from(textOverrideProps);
  const classes = Array.from(classOverrides);
  let returnedExpression = jsxOneOrMoreToJsxExpression(tsx);
  const isScreen = compName.includes('Screen')
  const isList = compName.includes('List')

  const hasOnClickChild = Array.from(onClickOverrideProps).length > 0
  const hasUseOnClick = hasOnClick || hasOnClickChild || isScreen
  const hasUseText = textOverridePropNames?.length || isScreen
  const hasHidde = Array.from(hideProps).length > 0 || isScreen
  const hasSwap = Array.from(swaps).length > 0 || isScreen
  const hasArray = !!returnedExpression.children.find(c =>
    c.tagName?.escapedText?.includes('List')) || isList

  // Create the component function as AST node
  const componentVariableStatement = factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(fnName),
          undefined,
          factory.createTypeReferenceNode(factory.createIdentifier('FC'), [
            factory.createTypeReferenceNode(factory.createIdentifier(`${compName}Props`), undefined),
          ]),
          factory.createCallExpression(factory.createIdentifier('memo'), undefined, [
            factory.createFunctionExpression(
              undefined,
              undefined,
              factory.createIdentifier(fnName),
              undefined,
              [
                factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  undefined,
                  factory.createIdentifier('props'),
                  undefined,
                  undefined,
                  factory.createObjectLiteralExpression([], false),
                ),
              ],
              undefined,
              factory.createBlock(
                [
                  ...prefixStatements,
                  ...(flags.destructureClassNames
                    ? [
                      factory.createVariableStatement(
                        undefined,
                        factory.createVariableDeclarationList(
                          [
                            factory.createVariableDeclaration(
                              factory.createObjectBindingPattern([
                                factory.createBindingElement(
                                  undefined,
                                  undefined,
                                  factory.createIdentifier('className'),
                                  undefined,
                                ),
                                ...(!classes?.length
                                  ? []
                                  : [
                                    factory.createBindingElement(
                                      undefined,
                                      factory.createIdentifier('classes'),
                                      factory.createObjectBindingPattern(
                                        classes.map(cl =>
                                          factory.createBindingElement(
                                            undefined,
                                            undefined,
                                            factory.createIdentifier(cl),
                                            undefined,
                                          ),
                                        ),
                                      ),
                                      factory.createObjectLiteralExpression([], false),
                                    ),
                                  ]),
                              ]),
                              undefined,
                              undefined,
                              factory.createIdentifier('props'),
                            ),
                          ],
                          ts.NodeFlags.Const,
                        ),
                      ),
                    ]
                    : []),
                  // Add use/<Component/>()
                  factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList(
                      [
                        factory.createVariableDeclaration(
                          factory.createObjectBindingPattern([
                            // Texts
                            /*!!hasUseText && */factory.createBindingElement(undefined, undefined, factory.createIdentifier('text')),
                            // !!textOverridePropNames?.length && factory.createBindingElement(
                            //   undefined,
                            //   factory.createIdentifier('text'),
                            //   factory.createObjectBindingPattern(
                            //     textOverridePropNames.map(cl =>
                            //       factory.createBindingElement(undefined, undefined, factory.createIdentifier(cl), undefined,),
                            //     ),
                            //   ),
                            // ),
                            // OnClick
                            !!hasUseOnClick && factory.createBindingElement(undefined, undefined, factory.createIdentifier('clicks')),
                            !!hasHidde && factory.createBindingElement(undefined, undefined, factory.createIdentifier('hide')),
                            !!hasSwap && factory.createBindingElement(undefined, undefined, factory.createIdentifier('swap')),
                            !!hasArray && factory.createBindingElement(undefined, undefined, factory.createIdentifier('array')),
                          ].filter(o => !!o)),
                          undefined,
                          undefined,
                          ts.factory.createCallExpression(
                            ts.factory.createIdentifier(`use${compName}`), // Function name (useComp)
                            undefined, // No type arguments
                            [ts.factory.createIdentifier("props")] // Arguments (props)
                          ),
                        )
                      ],
                      ts.NodeFlags.Const,
                    ),
                  ),
                  // Add return Element
                  !isList ? factory.createReturnStatement(returnedExpression) : factory.createReturnStatement(replaceJsxElementInAst(returnedExpression)),
                ],
                true,
              ),
            ),
          ]),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );

  if (!skipAnnotation) {
    wrapWithFigmaIdAnnotation(componentVariableStatement, moduleContext);
  }

  return componentVariableStatement;
}

const newJsxElement = (node: ts.Node) => ts.factory.createJsxElement(
  ts.factory.createJsxOpeningElement(
    ts.factory.createIdentifier("div"),
    undefined,
    ts.factory.createJsxAttributes([ts.factory.createJsxAttribute(
      ts.factory.createIdentifier("className"),
      ts.factory.createJsxExpression(undefined, ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead(""),
        [
          ts.factory.createTemplateSpan(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("resets"),
              ts.factory.createIdentifier("clapyResets")
            ),
            ts.factory.createTemplateMiddle(" ")
          ),
          ts.factory.createTemplateSpan(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("classes"),
              ts.factory.createIdentifier("root")
            ),
            ts.factory.createTemplateTail("")
          )
        ]
      ))
    )])
  ),
  [ts.factory.createJsxExpression(
    undefined,
    ts.factory.createConditionalExpression(
      ts.factory.createIdentifier("array"),
      ts.factory.createToken(ts.SyntaxKind.QuestionToken),
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier("array"),
          ts.factory.createIdentifier("map")
        ),
        undefined,
        [ts.factory.createArrowFunction(
          undefined,
          undefined,
          [
            ts.factory.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              ts.factory.createIdentifier("c"),
              undefined,
              undefined,
              undefined
            )
          ],
          undefined,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("c"),
            ts.factory.createIdentifier("comp")
          )
        )]
      ),
      ts.factory.createToken(ts.SyntaxKind.ColonToken),
      ts.factory.createJsxFragment(
        ts.factory.createJsxOpeningFragment(),
        // [ts.factory.createJsxSelfClosingElement(
        //   ts.factory.createIdentifier("div"),
        //   undefined,
        //   ts.factory.createJsxAttributes([])
        // )],
        node.children,
        ts.factory.createJsxJsxClosingFragment()
      )
    )
  )],
  ts.factory.createJsxClosingElement(ts.factory.createIdentifier("div"))
);

function replaceJsxElementInAst(node: ts.Node): ts.Node {
  if (ts.isJsxElement(node)) {
    // Check if this is the <div> we want to replace
    const tagName = node.openingElement?.tagName?.escapedText;
    // const childTagName = node.child.;
    if (tagName === "div") {
      // Return the new JSX element
      return newJsxElement(node);
    }
  }

  // Step 3: Recursively visit child nodes and try to replace the target node
  return ts.visitEachChild(node, replaceJsxElementInAst, {
    factory: ts.factory,
    getCompilerOptions: () => ({}),
    startLexicalEnvironment: () => { },
    suspendLexicalEnvironment: () => { },
    resumeLexicalEnvironment: () => { },
    endLexicalEnvironment: () => [],
    hoistFunctionDeclaration: () => { },
    hoistVariableDeclaration: () => { },
    requestEmitHelper: () => { },
    readEmitHelpers: () => undefined,
    isEmitNotificationEnabled: () => false,
    enableEmitNotification: () => { },
    disableEmitNotification: () => { },
    onSubstituteNode: () => (node: any) => node,
    onEmitNode: () => { },
  } as ts.TransformationContext);
}

export function wrapWithFigmaIdAnnotation<T extends Node>(node: T, moduleContext: ModuleContext) {
  // Attach an annotation with Figma ID.
  // Ideally, it should be TSDoc (/ JSDoc), but it is not supported by the ts compiler API.
  // As a workaround, we use multi-line comments.
  // https://stackoverflow.com/a/57206925/4053349
  // https://github.com/microsoft/TypeScript/issues/17146
  ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    ` @figmaId ${moduleContext.node.id} `,
    true,
  );
}

function mkWrapExpressionFragment(
  node: JsxOneOrMore | ts.ParenthesizedExpression | ts.ConditionalExpression | ts.BinaryExpression,
) {
  if (
    !Array.isArray(node) &&
    (ts.isParenthesizedExpression(node) || ts.isConditionalExpression(node) || ts.isBinaryExpression(node))
  ) {
    return factory.createJsxExpression(undefined, node);
  }
  return node;
}

function jsxOneOrMoreToExpression(ast: ts.Expression | JsxOneOrMore | undefined) {
  if (ast && (Array.isArray(ast) || ts.isJsxText(ast))) {
    return mkFragment(ast);
  }
  return ast;
}

export function mkFragment(children: ts.JsxChild | ts.JsxChild[]) {
  if (!Array.isArray(children)) {
    children = [children];
  }
  return factory.createJsxFragment(factory.createJsxOpeningFragment(), children, factory.createJsxJsxClosingFragment());
}

export function mkTag(tagName: string, classAttr: ts.JsxAttribute[] | null, children: ts.JsxChild[] | null, hasOnClick?: boolean) {
  return factory.createJsxElement(
    factory.createJsxOpeningElement(
      factory.createIdentifier(tagName),
      undefined,
      // factory.createJsxAttributes(classAttr ?? [])
      factory.createJsxAttributes([
        // Classes
        ...(classAttr ?? []),
        // OnClicks
        ...(hasOnClick ? [
          factory.createJsxAttribute(
            ts.factory.createIdentifier('onClick'), // Name of the attribute
            ts.factory.createJsxExpression(
              undefined, // No dot operator for optional chaining
              factory.createPropertyAccessChain(
                factory.createIdentifier('clicks'),
                factory.createToken(ts.SyntaxKind.QuestionDotToken),
                factory.createIdentifier('onClick'),
              )
            )
          )
        ] : []),
        // more...
      ]),
    ),
    children ?? [],
    factory.createJsxClosingElement(factory.createIdentifier(tagName)),
  );
}

export function mkInputTypeAttr(value = 'checkbox') {
  return mkStringAttr('type', value);
}

export function mkHrefAttr(url: string) {
  return mkStringAttr('href', url);
}

export function mkTargetBlankAttr() {
  return mkStringAttr('target', '_blank');
}

export function mkNoReferrerAttr() {
  return mkStringAttr('rel', 'noreferrer');
}

export function mkStringAttr(attributeName: string, value: string) {
  return factory.createJsxAttribute(factory.createIdentifier(attributeName), factory.createStringLiteral(value));
}

// If useful. Keep a couple of weeks and remove later.
// export function mkImg(srcVarName: string, extraAttributes: ts.JsxAttribute[]) {
//   return factory.createJsxSelfClosingElement(
//     factory.createIdentifier('img'),
//     undefined,
//     factory.createJsxAttributes([
//       factory.createJsxAttribute(
//         factory.createIdentifier('src'),
//         factory.createJsxExpression(undefined, factory.createIdentifier(srcVarName)),
//       ),
//       factory.createJsxAttribute(factory.createIdentifier('alt'), factory.createStringLiteral('')),
//       ...extraAttributes,
//     ]),
//   );
// }

export function mkSrcStaticAttribute(src: string) {
  return factory.createJsxAttribute(factory.createIdentifier('src'), factory.createStringLiteral(src));
}

export function mkIdAttribute(id: string) {
  return factory.createJsxAttribute(factory.createIdentifier('id'), factory.createStringLiteral(id));
}

export function mkSwapInstanceAlone(context: NodeContext, compAst: ts.JsxSelfClosingElement, node: SceneNode2) {
  let ast: ts.JsxSelfClosingElement | ts.Expression = compAst;
  let ast2: ts.JsxSelfClosingElement | ts.JsxExpression = compAst;
  if (node.swapName) {
    ast = factory.createBinaryExpression(
      factory.createPropertyAccessChain(
        factory.createPropertyAccessExpression(factory.createIdentifier('props'), factory.createIdentifier('swap')),
        factory.createToken(ts.SyntaxKind.QuestionDotToken),
        factory.createIdentifier(node.swapName),
      ),
      factory.createToken(ts.SyntaxKind.BarBarToken),
      jsxOneOrMoreToExpression(ast)!,
    );
    ast2 = factory.createJsxExpression(undefined, jsxOneOrMoreToExpression(ast)!);
  }
  return context.isRootInComponent ? mkFragment(ast2) : ast2;
}

export function mkSwapInstanceAndHideWrapper(
  context: NodeContext,
  compAst: ts.JsxSelfClosingElement | undefined,
  node: SceneNode2,
) {
  let ast: ts.JsxSelfClosingElement | ts.Expression | undefined = compAst;
  let ast2: ts.JsxSelfClosingElement | ts.JsxExpression | undefined = compAst;
  if (node.swapName) {
    const expr = jsxOneOrMoreToExpression(ast);
    ast = factory.createBinaryExpression(
      factory.createPropertyAccessChain(
        // factory.createPropertyAccessExpression(factory.createIdentifier('props'), factory.createIdentifier('swap')),
        factory.createIdentifier('swap'),
        factory.createToken(ts.SyntaxKind.QuestionDotToken),
        factory.createIdentifier(node.swapName),
      ),
      factory.createToken(ts.SyntaxKind.BarBarToken),
      expr || factory.createNull(),
    );
  }
  ast = mkWrapHideExprFragment(ast, node);
  if (!ast) return;
  if (node.swapName || node.hideProp) {
    ast2 = factory.createJsxExpression(undefined, jsxOneOrMoreToExpression(ast)!);
  }
  return context.isRootInComponent && ast2 ? mkFragment(ast2) : ast2;
}

function mkWrapTextOverrideExprFragment(ast: JsxOneOrMore | undefined, node: SceneNode2) {
  if (!ast || !node.textOverrideProp) {
    return ast;
  }

  return ts.factory.createConditionalExpression(
    ts.factory.createBinaryExpression(
      ts.factory.createPropertyAccessChain(
        ts.factory.createIdentifier("text"),
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createIdentifier(node.textOverrideProp)
      ),
      ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ts.factory.createNull()
    ),
    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    ts.factory.createPropertyAccessChain(
      ts.factory.createIdentifier("text"),
      ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
      ts.factory.createIdentifier(node.textOverrideProp)
    ),
    ts.factory.createToken(ts.SyntaxKind.ColonToken),
    jsxOneOrMoreToJsxExpression(ast)
  );
}

function mkWrapHideExprFragment<T extends JsxOneOrMore | ts.Expression | undefined>(ast: T, node: SceneNode2) {
  if (!node.hideProp) {
    return ast;
  }
  let hideDefaultValue = !node.visible;
  if (hideDefaultValue == null) {
    warnOrThrow(`Node ${node.name} is missing hideOverrideValue although it has a hideProp.`);
    hideDefaultValue = true;
  }
  const hidePropVar = factory.createPropertyAccessChain(
    // factory.createPropertyAccessExpression(factory.createIdentifier('props'), factory.createIdentifier('hide')),
    factory.createIdentifier('hide'),
    factory.createToken(ts.SyntaxKind.QuestionDotToken),
    factory.createIdentifier(node.hideProp),
  );
  const checkHideExpr =
    hideDefaultValue === true ?
      // factory.createBinaryExpression(
      //   hidePropVar,
      //   factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
      //   factory.createFalse(),
      // )
      hidePropVar
      : factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, hidePropVar);
  const ast2 = factory.createBinaryExpression(
    checkHideExpr,
    factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
    jsxOneOrMoreToJsxExpression(ast),
  );
  return ast2;
}

export function mkWrapHideAndTextOverrideAst<T extends boolean>(
  context: NodeContext,
  ast: JsxOneOrMore | undefined,
  node: SceneNode2,
  isJsExprAllowed: T,
): T extends true
  ? JsxOneOrMore | ts.BinaryExpression | ts.ConditionalExpression | undefined
  : JsxOneOrMore | undefined {
  const astTmp = mkWrapTextOverrideExprFragment(ast, node);
  const ast2 = mkWrapHideExprFragment(astTmp, node);
  if (!ast2) return;
  if (ast === ast2 || isJsExprAllowed) return ast2 as JsxOneOrMore;
  const ast3: JsxOneOrMore = mkWrapExpressionFragment(ast2);
  return context.isRootInComponent ? mkFragment(ast3) : ast3;
}

export function mkClassAttr2<T extends BaseStyleOverride | undefined>(
  overrideEntry: T,
  extraConfig: ExtraConfig,
): T extends BaseStyleOverride ? ts.JsxAttribute : undefined {
  if (!overrideEntry) return undefined as T extends BaseStyleOverride ? ts.JsxAttribute : undefined;
  const classExpr = mkClassExpression(overrideEntry, extraConfig);
  if (!classExpr) {
    return undefined as T extends BaseStyleOverride ? ts.JsxAttribute : undefined;
  }

  return factory.createJsxAttribute(
    factory.createIdentifier('className'),
    factory.createJsxExpression(undefined, classExpr),
  ) as T extends BaseStyleOverride ? ts.JsxAttribute : undefined;
}

export function mkClassAttr3(className: string) {
  return factory.createJsxAttribute(
    factory.createIdentifier('className'),
    factory.createJsxExpression(
      undefined,
      factory.createPropertyAccessExpression(factory.createIdentifier('classes'), factory.createIdentifier(className)),
    ),
  );
}

function mkClassExpression(overrideEntry: BaseStyleOverride, extraConfig: ExtraConfig) {
  const { overrideValue, propValue } = overrideEntry;
  if (!overrideValue && !propValue) {
    throw new Error(
      `[mkClassExpression] BUG Missing both overrideValue and propValue when writing overrides for node ${(overrideEntry as FigmaOverride<any>).intermediateNode?.name
      }, prop ${(overrideEntry as FigmaOverride<any>).propName}.`,
    );
  }
  const isRoot = overrideValue === 'root' || propValue === 'root';
  const exprFragments: (ts.BinaryExpression | ts.PropertyAccessExpression)[] = [];

  if (isRoot) {
    exprFragments.push(
      factory.createPropertyAccessExpression(
        factory.createIdentifier('resets'),
        factory.createIdentifier('clapyResets'),
      ),
    );
  }

  if (propValue) {
    const propClassesExpr = factory.createBinaryExpression(
      factory.createPropertyAccessChain(
        factory.createPropertyAccessExpression(factory.createIdentifier('props'), factory.createIdentifier('classes')),
        factory.createToken(ts.SyntaxKind.QuestionDotToken),
        factory.createIdentifier(propValue),
      ),
      factory.createToken(ts.SyntaxKind.BarBarToken),
      factory.createStringLiteral(''),
    );
    exprFragments.push(propClassesExpr);
    if (isRoot) {
      const propClassNameExpr = factory.createBinaryExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier('props'),
          factory.createIdentifier('className'),
        ),
        factory.createToken(ts.SyntaxKind.BarBarToken),
        factory.createStringLiteral(''),
      );
      exprFragments.push(propClassNameExpr);
    }
  }

  if (overrideValue) {
    exprFragments.push(
      factory.createPropertyAccessExpression(
        factory.createIdentifier('classes'),
        factory.createIdentifier(overrideValue),
      ),
    );
  }

  const nbExpr = exprFragments.length;
  if (nbExpr === 0) return undefined;
  if (nbExpr === 1) return exprFragments[0];
  return factory.createTemplateExpression(
    factory.createTemplateHead('', ''),
    exprFragments.map((expr, i) =>
      factory.createTemplateSpan(
        expr,
        i !== nbExpr - 1 ? factory.createTemplateMiddle(' ', ' ') : factory.createTemplateTail('', ''),
      ),
    ),
  );
}

export function mkClassesAttribute2(moduleContext: ModuleContext, otherClassOverrides: StyleOverride[]) {
  const {
    projectContext: { extraConfig },
  } = moduleContext;
  const entries = Object.values(otherClassOverrides);
  if (!entries.length) return undefined;
  try {
    return factory.createJsxAttribute(
      factory.createIdentifier('classes'),
      factory.createJsxExpression(
        undefined,
        factory.createObjectLiteralExpression(
          entries.map(styleOverride => {
            const { propName } = styleOverride;
            const classExpr = mkClassExpression(styleOverride, extraConfig);
            if (!classExpr) {
              throw new Error('[mkClassesAttribute] Failed to generate classExpr, see logs.');
            }

            return factory.createPropertyAssignment(factory.createIdentifier(propName), classExpr);
          }),
          false,
        ),
      ),
    );
  } catch (error) {
    if (env.isDev) throw error;
    return undefined;
  }
}

// Those mk* overrides methods can be refactored. They share a common structure.
export function mkSwapsAttribute(swaps: CompContext['instanceSwaps']) {
  const swapsArr = Object.values(swaps);
  if (!swapsArr.length) return undefined;
  return factory.createJsxAttribute(
    factory.createIdentifier('swap'),
    factory.createJsxExpression(
      undefined,
      factory.createObjectLiteralExpression(
        swapsArr.map(overrideEntry => {
          const { propName, overrideValue, propValue } = overrideEntry;
          if (!overrideValue && !propValue) {
            throw new Error(
              `[mkSwapsAttribute] BUG Missing both overrideValue and propValue when writing overrides for node ${(overrideEntry as FigmaOverride<any>).intermediateNode?.name
              }, prop ${(overrideEntry as FigmaOverride<any>).propName}.`,
            );
            // overrideEntry may not be a FigmaOverride, but the base version only, so propName and intermediateNode are not guaranteed to exist. But if they do, they bring useful information for the error message.
          }

          const propExpr = propValue
            ? factory.createPropertyAccessChain(
              factory.createPropertyAccessExpression(
                factory.createIdentifier('props'),
                factory.createIdentifier('swap'),
              ),
              factory.createToken(ts.SyntaxKind.QuestionDotToken),
              factory.createIdentifier(propValue),
            )
            : undefined;

          const overrideValueAst = jsxOneOrMoreToExpression(overrideValue);

          const ast = !propValue
            ? overrideValueAst!
            : !overrideValue
              ? propExpr!
              : factory.createBinaryExpression(
                propExpr!,
                factory.createToken(ts.SyntaxKind.BarBarToken),
                overrideValueAst!,
              );

          return factory.createPropertyAssignment(factory.createIdentifier(propName), ast);
        }),
        true,
      ),
    ),
  );
}

export function mkHidingsAttribute(hidings: CompContext['instanceHidings']) {
  // Possible improvements: default values are not managed, although it could. But for that, we need to first ensure the parent component passes well the hide value for the grandchild instance, then the intermediate component, mapping hide to its props, can apply a default value.
  // The generated code could look like:
  //    hide={{
  //      btnTxt: props.hide?.btnTxt != null ? props.hide?.btnTxt : [defaultValue, true or false],
  //    }}
  // Even better (later?), we could add the notion of default values in the component props directly.
  const entries = Object.values(hidings);
  if (!entries.length) return undefined;
  return factory.createJsxAttribute(
    factory.createIdentifier('hide'),
    factory.createJsxExpression(
      undefined,
      factory.createObjectLiteralExpression(
        entries.map(overrideEntry => {
          const { propName, overrideValue, propValue } = overrideEntry;
          if (overrideValue == null && propValue == null) {
            throw new Error(
              `[mkHidingsAttribute] BUG Missing both overrideValue and propValue when writing overrides for node ${(overrideEntry as FigmaOverride<any>).intermediateNode?.name
              }, prop ${(overrideEntry as FigmaOverride<any>).propName}.`,
            );
            // overrideEntry may not be a FigmaOverride, but the base version only, so propName and intermediateNode are not guaranteed to exist. But if they do, they bring useful information for the error message.
          }

          const propExpr = propValue
            ? factory.createPropertyAccessChain(
              factory.createPropertyAccessExpression(
                factory.createIdentifier('props'),
                factory.createIdentifier('hide'),
              ),
              factory.createToken(ts.SyntaxKind.QuestionDotToken),
              factory.createIdentifier(propValue),
            )
            : undefined;

          const overrideValueAst =
            overrideValue == null ? undefined : overrideValue ? factory.createTrue() : factory.createFalse();

          const ast = !propValue
            ? overrideValueAst!
            : overrideValue == null
              ? propExpr!
              : factory.createBinaryExpression(
                propExpr!,
                factory.createToken(ts.SyntaxKind.BarBarToken),
                overrideValueAst!,
              );

          return factory.createPropertyAssignment(factory.createIdentifier(propName), ast);
        }),
        true,
      ),
    ),
  );
}

// export function mkOnClickOverridesAttribute(onClickOverrides: CompContext['instanceOnClickOverrides']) {
// let onClickCount = 0
// const findOnClickOverride = (returnedExpression: any) => {
//   returnedExpression?.children?.forEach(
//     (c: any) => c.attributes?.properties?.forEach(
//       (p: any) => { if (p.name.escapedText === 'onClick') onClickCount++ }))
// }
// // findOnClickOverride(returnedExpression)
// return ts.factory.createJsxAttribute(
//   ts.factory.createIdentifier('onClick'), // The attribute name "onClick"
//   ts.factory.createJsxExpression(
//     undefined, // No optional chaining
//     ts.factory.createIdentifier(`onClick${onClickCount}`) // The expression value, "onClick"
//   )
// );
// }

export function mkOnClickOverridesAttribute(instanceOnClickOverrides: CompContext['instanceOnClickOverrides'], id: string) {
  const entries = Object.values(instanceOnClickOverrides);
  if (!entries.length) return undefined;
  return factory.createJsxAttribute(
    factory.createIdentifier('clicks'),
    factory.createJsxExpression(
      undefined,
      factory.createObjectLiteralExpression(
        entries
          .filter(e => !!e.propValue || !entries.find(e => !!e.propValue))
          .map(overrideEntry => {
            const { propName, overrideValue, propValue } = overrideEntry;
            if (overrideValue == null && propValue == null) {
              throw new Error(
                `[mkTextOverridesAttribute] BUG Missing both overrideValue and propValue when writing overrides for node ${(overrideEntry as FigmaOverride<any>).intermediateNode?.name
                }, prop ${(overrideEntry as FigmaOverride<any>).propName}.`,
              );
              // overrideEntry may not be a FigmaOverride, but the base version only, so propName and intermediateNode are not guaranteed to exist. But if they do, they bring useful information for the error message.
            }

            const propertyAccess = factory.createPropertyAccessChain(
              ts.factory.createIdentifier("clicks"), // Object `clicks`
              ts.factory.createToken(ts.SyntaxKind.QuestionDotToken), // Optional chaining `?.`
              ts.factory.createIdentifier("onClick") // Property `onClick`
            );

            // Step 3: Create the function call `clicks?.onClick('8:563:')`
            const functionCall = factory.createCallExpression(
              propertyAccess,
              undefined, // No type arguments
              [factory.createStringLiteral(`${id}:${propName.split('onClick').join('')}`)] // Argument `'8:563:'`
            );

            // Step 4: Create the logical AND expression `clicks?.onClick && clicks?.onClick('8:563:')`
            const logicalAnd = factory.createBinaryExpression(
              propertyAccess, // Left-hand side `clicks?.onClick`
              ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken), // Logical AND `&&`
              functionCall // Right-hand side `clicks?.onClick('8:563:')`
            );

            const arrowFunction = factory.createArrowFunction(
              undefined, // No modifiers
              undefined, // No type parameters
              [], // No parameters
              undefined, // No return type (inferred as `void`)
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), // The `=>` token
              logicalAnd // The body of the arrow function (logical AND expression)
            );

            const propExpr = propValue
              ? factory.createPropertyAccessChain(
                factory.createIdentifier('clicks'),
                factory.createToken(ts.SyntaxKind.QuestionDotToken),
                factory.createIdentifier(propValue),
              )
              : arrowFunction;

            return factory.createPropertyAssignment(factory.createIdentifier(entries.filter(e => !!e.propValue).length === 1 ? 'onClick' : propName), propExpr);
          }),
        true,
      ),
    ),
  );
}

export function mkArrayOverridesAttribute(instanceOnClickOverrides: CompContext['instanceOnClickOverrides'], id: string) {
  return factory.createJsxAttribute(
    factory.createIdentifier("array"), // Prop name 'array'
    factory.createJsxExpression(
      undefined,
      factory.createIdentifier("array") // The value is an identifier 'array'
    )
  );
}

export function mkTextOverridesAttribute(textOverrides: CompContext['instanceTextOverrides']) {
  // Possible improvements: default values (cf other overrides like hidings)
  const entries = Object.values(textOverrides);
  if (!entries.length) return undefined;
  return factory.createJsxAttribute(
    factory.createIdentifier('text'),
    factory.createJsxExpression(
      undefined,
      factory.createObjectLiteralExpression(
        entries.map(overrideEntry => {
          const { propName, overrideValue, propValue } = overrideEntry;
          if (overrideValue == null && propValue == null) {
            throw new Error(
              `[mkTextOverridesAttribute] BUG Missing both overrideValue and propValue when writing overrides for node ${(overrideEntry as FigmaOverride<any>).intermediateNode?.name
              }, prop ${(overrideEntry as FigmaOverride<any>).propName}.`,
            );
            // overrideEntry may not be a FigmaOverride, but the base version only, so propName and intermediateNode are not guaranteed to exist. But if they do, they bring useful information for the error message.
          }

          const propExpr = propValue
            ? factory.createPropertyAccessChain(
              // factory.createPropertyAccessExpression(
              //   factory.createIdentifier('props'),
              //   factory.createIdentifier('text'),
              // ),
              factory.createIdentifier('text'),
              factory.createToken(ts.SyntaxKind.QuestionDotToken),
              factory.createIdentifier(propValue),
            )
            : undefined;

          const overrideValueAst = jsxOneOrMoreToJsxExpression(overrideValue);
          const auxPropName = overrideValueAst?.openingElement?.attributes?.properties[0]?.initializer?.expression?.name?.escapedText

          const ast = !propValue
            ? (auxPropName ? factory.createBinaryExpression(
              factory.createPropertyAccessChain(
                factory.createIdentifier('text'),
                factory.createToken(ts.SyntaxKind.QuestionDotToken),
                factory.createIdentifier(auxPropName),
              ),
              factory.createToken(ts.SyntaxKind.BarBarToken),
              overrideValueAst!,
            ) : overrideValueAst)
            : overrideValue == null
              ? propExpr!
              : factory.createBinaryExpression(
                propExpr,
                factory.createToken(ts.SyntaxKind.BarBarToken),
                overrideValueAst!,
              );

          return factory.createPropertyAssignment(factory.createIdentifier(propName), ast);
        }),
        true,
      ),
    ),
  );
}
