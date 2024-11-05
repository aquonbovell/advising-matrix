import { fetchCourses } from '../src/lib/actions/course.actions';
import * as fs from 'fs/promises';

try {
	const data = await fetchCourses('7aa4ba37-d686-4ebe-82b8-2c331b999684');
	await fs.writeFile('output2.json', JSON.stringify(data, null, 2));
} catch (error) {
	console.error(error);
} finally {
	console.log('Done');
}
