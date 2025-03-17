import Debug from 'debug';

import app from './app';
import { ENV, PORT } from './settings';

const debug = Debug('abbapodcast:api:server');

// Apenas inicie o servidor se não estiver sendo importado por outro módulo
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    debug(`server started: PORT: ${PORT} | ENV: ${ENV}`);
  });
}

// Exportar o app para ser usado pelo Vercel
module.exports = app;
