import type { ActionReturn } from 'svelte/action';

interface Attributes {
	'on:clickoutside'?: (e: CustomEvent<boolean>) => void;
}

export function clickOutside(node: HTMLElement): ActionReturn<undefined, Attributes> {
	const handleClick = (e: MouseEvent) => {
		if (node && !node.contains(e.target as Node) && !e.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('clickoutside'));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
