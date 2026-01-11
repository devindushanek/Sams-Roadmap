/**
 * UI utility functions
 */

/**
 * Automatically resize a textarea based on its content
 * @param {Object|Event} target - The textarea element or an event object
 */
export const autoResizeTextarea = (target) => {
    const element = target.target || target.current || target;
    if (!element) return;

    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
};
