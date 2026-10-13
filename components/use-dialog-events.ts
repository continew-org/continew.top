'use client';

import { useEffect, type RefObject } from 'react';

/**
 * 原生 `<dialog>` 的交互监听：直接挂到元素上，而不是写成 JSX 事件属性。
 *
 * 【为什么不写在 JSX 上】
 * jsx-a11y 把 `<dialog>` 视作非交互元素：在它上面挂鼠标/键盘处理函数会被判定为
 * 「非交互元素不应有事件处理器」「点击必须有键盘等价物」。这个判断在原生 `<dialog>`
 * 上并不成立——键盘等价物是浏览器内置的 Esc 关闭（onCancel / onClose），本就无需额外按键。
 * 监听挂在元素上行为完全一致，判断也不再误报。
 *
 * 【为什么抽成公共 hook】
 * 五个弹层（交流群 / 参与贡献 / 公众号 / 赞赏 / 图片查看器）此前各写一份
 * `event.target === ref.current` 判断，抽到这里只留一份。
 */

/** 点遮罩（即 dialog 自身，内容区不冒泡到这里）时触发 onDismiss。 */
export function useBackdropDismiss(
  ref: RefObject<HTMLDialogElement | null>,
  onDismiss: () => void,
): void {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleClick = (event: MouseEvent) => {
      if (event.target === dialog) onDismiss();
    };

    dialog.addEventListener('click', handleClick);
    return () => dialog.removeEventListener('click', handleClick);
  }, [ref, onDismiss]);
}

/** 在弹层内按键时触发（showModal 的焦点陷阱保证事件从弹层内部冒泡到这里）。 */
export function useDialogKeydown(
  ref: RefObject<HTMLDialogElement | null>,
  onKeyDown: (event: KeyboardEvent) => void,
): void {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleKeyDown = (event: KeyboardEvent) => onKeyDown(event);

    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, [ref, onKeyDown]);
}
