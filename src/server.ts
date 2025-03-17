import Debug from 'debug';

import app from './app';
import { ENV, PORT } from './settings';

const debug = Debug('abbapodcast:api:server');

app.listen(PORT, () => {
  debug(`server started: PORT: ${PORT} | ENV: ${ENV}`);
});
