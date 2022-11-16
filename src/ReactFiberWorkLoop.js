import {
  ClassComponent,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostText,
} from './ReactWorkTags';
import {
  updateHostComponent,
  updateFunctionComponent,
  updateClassComponent,
  updateFragmentComponent,
  updateHostTextComponent,
} from './ReactFiberReconciler';
import { Placement } from './utils';

// work in progress 当前正在工作中的
let wip = null;
let wipRoot = null;

// 实现组件初次渲染和更新
export function scheduleUpdateOnFiber(fiber) {
  wip = fiber;
  wipRoot = fiber;
}

function performUnitOfWork() {
  const { tag } = wip;
  // 1.更新当前组件
  switch (tag) {
    case HostComponent:
      updateHostComponent(wip);
      break;
    case FunctionComponent:
      updateFunctionComponent(wip);
      break;
    case ClassComponent:
      updateClassComponent(wip);
      break;
    case Fragment:
      updateFragmentComponent(wip);
      break;
    case HostText:
      updateHostTextComponent(wip);
      break;
    default:
      break;
  }

  // 2.更新下个节点
  if (wip.child) {
    wip = wip.child;
    return;
  }

  let next = wip;
  while (next) {
    if (next.sibling) {
      wip = next.sibling;
      return;
    }

    next = next.return;
  }

  wip = null;
}

function workLoop(IdleDeadline) {
  while (wip && IdleDeadline.timeRemaining() > 0) {
    performUnitOfWork();
  }

  if (!wip && wipRoot) {
    commitRoot();
  }
}

// requestIdleCallback(workLoop);

function commitRoot() {
  commitWorker(wipRoot);
  wipRoot = null;
}

function commitWorker(wip) {
  if (!wip) return;
  // 1.提交自己
  const parentNode = getParentNode(wip.return);
  const { flags, stateNode } = wip;
  if (flags & Placement && stateNode) {
    parentNode.appendChild(stateNode);
  }
  // 2.提交子节点
  commitWorker(wip.child);
  // 3.提交兄弟节点
  commitWorker(wip.sibling);
}

function getParentNode(wip) {
  let tem = wip;
  while (tem) {
    if (tem.stateNode) {
      return tem.stateNode;
    }
    tem = tem.return;
  }
}