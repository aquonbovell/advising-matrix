import type { Degree } from '$lib/types';
import { getContext, setContext } from 'svelte';
import { get, writable } from 'svelte/store';
import { fetchDegree } from './utils';

export class MatrixState {
	degree = writable<Degree | null>(null);

	constructor(majorId: string, minorId: string) {
		console.log('MatrixState constructor');
		this.initState(majorId, minorId);
	}

	async initState(majorId: string, minorId: string) {
		const degree = await fetchDegree(majorId, minorId);
		this.degree.set(degree);
	}

	getDetails() {
		return get(this.degree);
	}
}

const MATRIX_KEY = Symbol('matrix');

export function setMatrixState(majorId: string, minorId: string) {
	return setContext(MATRIX_KEY, new MatrixState(majorId, minorId));
}

export function getMatrixState() {
	return getContext<ReturnType<typeof setMatrixState>>(MATRIX_KEY);
}
