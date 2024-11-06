import { fetchMajors, initMajors } from '../src/lib/actions/major.actions';
import { fetchMinors, initMinors } from '../src/lib/actions/minor.actions';
import * as fs from 'fs/promises';

try {
	// const minors = await fetchMinors();
	// await fs.writeFile('minors.json', JSON.stringify(minors, null, 2));
	// const majors = await fetchMajors();
	// await fs.writeFile('majors.json', JSON.stringify(majors, null, 2));
	await initMajors();
	await initMinors();
} catch (error) {
	console.error(error);
} finally {
	console.log('Done');
}
