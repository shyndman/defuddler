import fs from 'fs/promises';
import { Logger } from 'winston';

/**
 * Outputs the result to file or stdout
 */
export async function outputResult(
  output: string,
  outputPath?: string,
  logger?: Logger
): Promise<void> {
  if (outputPath) {
    await writeToFile(output, outputPath, logger);
  } else {
    writeToStdout(output, logger);
  }
}

/**
 * Writes output to a file
 */
async function writeToFile(output: string, outputPath: string, logger?: Logger): Promise<void> {
  logger?.debug(`Writing output to file: ${outputPath}`);
  await fs.writeFile(outputPath, output, 'utf-8');
  logger?.info(`Output written to ${outputPath}`);
}

/**
 * Writes output to stdout
 */
function writeToStdout(output: string, logger?: Logger): void {
  logger?.debug('Writing output to stdout');
  console.log(output);
}
