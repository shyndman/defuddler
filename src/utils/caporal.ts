// Re-export caporal so that we don't have to do weird module
// destructuring all over the place.
import pkg from '@caporal/core';
export const { program } = pkg;
export type Program = pkg.Program;
