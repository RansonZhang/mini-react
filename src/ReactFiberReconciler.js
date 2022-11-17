import { updateNode } from './utils';
import { reconcileChildren } from './ReactChildFiber';
import { renderWithHooks } from './hooks';

// 原生标签
export function updateHostComponent(wip) {
  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type);
    updateNode(wip.stateNode, {}, wip.props);
  }

  reconcileChildren(wip, wip.props.children);
}

export function updateFunctionComponent(wip) {
  renderWithHooks(wip);
  const { type, props } = wip;
  const children = type(props);
  reconcileChildren(wip, children);
}

export function updateClassComponent(wip) {
  const { type, props } = wip;
  const instance = new type(props);
  const children = instance.render();
  reconcileChildren(wip, children);
}

export function updateFragmentComponent(wip) {
  reconcileChildren(wip, wip.props.children);
}

export function updateHostTextComponent(wip) {
  wip.stateNode = document.createTextNode(wip.props.children);
}
