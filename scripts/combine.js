import fs from 'node:fs/promises';

import bio from './biological.json' with { type: 'json' };
import chem from './chemical.json' with { type: 'json' };
import cs from './computerscience.json' with { type: 'json' };
import elet from './electronics.json' with { type: 'json' };
import ensc from './environmental.json' with { type: 'json' };
import math from './mathematics.json' with { type: 'json' };
import mete from './meterology.json' with { type: 'json' };
import phys from './physics.json' with { type: 'json' };
import swen from './softwareengineering.json' with { type: 'json' };

const combined = bio.concat(chem, cs, elet, ensc, math, mete, phys, swen);

await fs.writeFile('./courses.json', JSON.stringify(combined));
