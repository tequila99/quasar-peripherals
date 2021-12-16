const logger = require('electron-log')
module.exports = (levels = []) => {
  if (!Array.isArray(levels)) throw new Error('Параметр для задания уровня логгирования должен представлять собой массив строк')
  return {
    log (msg) { logger.info('log:', msg) },
    info (msg) { if (levels.includes('info')) { logger.info('info:', msg) } },
    error (msg) { if (levels.includes('error')) { logger.error('error:', msg) } },
    debug (msg) { if (levels.includes('debug')) { logger.debug('debug', msg) } },
    warn (msg) { if (levels.includes('warn')) { logger.warn('warn', msg) } },
    fatal (msg) { if (levels.includes('fatal')) { logger.error('fatal', msg) } },
    trace (msg) { if (levels.includes('trace')) { logger.info('trace', msg) } },
    child () { return this }
  }
}
