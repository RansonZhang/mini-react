import { isFn, isStr, Placement, isUndefined } from './utils';
import {
  ClassComponent,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostText,
} from './ReactWorkTags';

export function createFiber(vnode, returnFiber) {
  const fiber = {
    type: vnode.type,
    key: vnode.key,
    props: vnode.props,
    // 不同类型的组件的stateNode不同
    // 原生标签，dom节点
    // class，实例
    stateNode: null,
    // 第一个子fiber
    child: null,
    // 下一个兄弟节点
    sibling: null,
    return: returnFiber,

    flags: Placement,
    // 记录节点在等当前层级下的位置
    index: null,
  };

  const { type } = vnode;
  if (isStr(type)) {
    fiber.tag = HostComponent;
  } else if (isFn(type)) {
    fiber.tag = type.prototype.isReactComponent
      ? ClassComponent
      : FunctionComponent;
  } else if (isUndefined(type)) {
    fiber.tag = HostText;
    fiber.props = { children: vnode };
  } else {
    fiber.tag = Fragment;
  }

  return fiber;
}
