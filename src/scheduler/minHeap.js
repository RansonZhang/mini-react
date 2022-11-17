/**
 * 返回最小堆堆顶元素
 * @param heap
 */
export function peek(heap) {
  return heap.length === 0 ? null : heap[0];
}

/**
 * 向最小堆插入元素
 * @param heap
 */
export function push(heap, node) {
  let index = heap.length;
  heap.push(node);
  // 向上调整，令其符合最小堆定义
  siftUp(heap, node, index);
}

/**
 *向上调整最小堆
 * @param heap
 * @param node
 * @param i
 */
function siftUp(heap, node, i) {
  let index = i;
  // 因为index对应父节点的下标，所以必须大于0
  while (index > 0) {
    const parentIndex = (index - 1) >> 1;
    const parent = heap[parentIndex];
    if (compare(parent, node) > 0) {
      // parent>node，不符合最小堆定义
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}

function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}

/**
 * 删除堆顶元素
 */
export function pop(heap) {
  if (heap.length === 0) return null;

  const first = heap[0];
  const last = heap.pop();
  if (first !== last) {
    heap[0] = last;
    // 向下调整，令其符合最小堆定义
    siftDown(heap, last, 0);
  }

  return first;
}

/**
 * 向下调整最小堆
 * @param heap
 * @param node
 * @param i
 */
function siftDown(heap, node, i) {
  let index = i;
  const length = heap.length;
  const halfLength = length >> 1;
  while (index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1;
    const rightIndex = leftIndex + 1;
    const left = heap[leftIndex];
    const right = heap[rightIndex];
    if (compare(left, node) < 0) {
      // left < node
      if (rightIndex < length && compare(right, left) < 0) {
        // right最小
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // 无right或left < right
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      return;
    }
  }
}

// const a = [3, 7, 4, 10, 12, 9, 6, 15, 14];

// push(a, 8);

// while (1) {
//   if (a.length === 0) {
//     break;
//   }
//   console.log('a', peek(a)); //sy-log
//   pop(a);
// }
