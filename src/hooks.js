import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';
import { HookLayout, HookPassive, areHookInputsEqual } from './utils';

let currentlyRenderingFiber = null;
let workInProgressHook = null;

let currentHook = null;

export function renderWithHooks(wip) {
  currentlyRenderingFiber = wip;
  // 因为函数组件刚开始，故应该没有首个hook，即没有hook单链表
  currentlyRenderingFiber.memorizedState = null;
  // 因为函数组件刚开始，故应该没有工作中的hook
  workInProgressHook = null;

  // 源码中这2个队列是在同一个链表中，不做区分
  // 此处简单处理为数组
  currentlyRenderingFiber.updateQueueOfEffect = [];
  currentlyRenderingFiber.updateQueueOfLayout = [];
}

function updateWorkInProgressHook() {
  let hook;
  const current = currentlyRenderingFiber.alternate;
  if (current) {
    // 组件更新
    currentlyRenderingFiber.memorizedState = current.memorizedState;
    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next;
      currentHook = currentHook.next;
    } else {
      workInProgressHook = hook = currentlyRenderingFiber.memorizedState;
      currentHook = current.memorizedState;
    }
  } else {
    // 初次渲染
    currentHook = null;
    hook = {
      memorizedState: null, // state,effect
      next: null,
    };
    if (workInProgressHook) {
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      // 首个hook
      workInProgressHook = currentlyRenderingFiber.memorizedState = hook;
    }
  }

  return hook;
}

export function useReducer(reducer, initalState) {
  const hook = updateWorkInProgressHook();

  if (!currentlyRenderingFiber.alternate) {
    // 组件初次渲染，初始化值
    hook.memorizedState = initalState;
  }

  const dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    hook,
    reducer
  );

  return [hook.memorizedState, dispatch];
}

function dispatchReducerAction(fiber, hook, reducer, action) {
  hook.memorizedState = reducer ? reducer(hook.memorizedState) : action;
  // 函数组件的老fiber即自身
  fiber.alternate = { ...fiber };
  // 不更新兄弟节点
  fiber.sibling = null;
  scheduleUpdateOnFiber(fiber);
}

export function useState(initalState) {
  return useReducer(null, initalState);
}

function updateEffectImp(hookFlags, create, deps) {
  const hook = updateWorkInProgressHook();

  if (currentHook) {
    const prevEffect = currentHook.memorizedState;
    if (deps) {
      const prevDeps = prevEffect.deps;
      // 如果前后依赖项都一样，
      // 则每次渲染函数组件时重置的副作用队列就是空数组，故不会执行相关的副作用操作
      if (areHookInputsEqual(deps, prevDeps)) {
        return;
      }
    }
  }
  const effect = { hookFlags, create, deps };

  hook.memorizedState = effect;
  if (hookFlags & HookPassive) {
    currentlyRenderingFiber.updateQueueOfEffect.push(effect);
  } else if (hookFlags & HookLayout) {
    currentlyRenderingFiber.updateQueueOfLayout.push(effect);
  }
}

export function useEffect(create, deps) {
  return updateEffectImp(HookPassive, create, deps);
}

export function useLayoutEffect(create, deps) {
  return updateEffectImp(HookLayout, create, deps);
}
