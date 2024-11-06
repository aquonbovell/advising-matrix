import { fetchMajors, initMajors } from '../src/lib/actions/major.actions';
import { fetchMinors, initMinors } from '../src/lib/actions/minor.actions';
import { fetchCourses, initCourses } from '../src/lib/actions/course.action';
import * as fs from 'fs/promises';

try {
	// const courses = await fetchCourses();
	// await fs.writeFile('courses2.json', JSON.stringify(courses, null, 2));
	// const majors = await fetchMajors();
	// await fs.writeFile('majors.json', JSON.stringify(majors, null, 2));
	// await initMajors();
	// await initMinors();
	await initCourses();
} catch (error) {
	console.error(error);
} finally {
	console.log('Done');
}
