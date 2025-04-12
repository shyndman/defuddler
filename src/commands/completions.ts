import chalk from 'chalk';
import { ShellType } from '../types/index.js';
import { Program } from '../utils/caporal.js';

/**
 * Sets up the completions command for the CLI
 *
 * Caporal uses tabtab under the hood for shell completions.
 * This command helps users install shell completions for the CLI.
 *
 * Note: Caporal automatically registers a hidden `completion` command
 * that's used by the shell to get completion suggestions. This command
 * is different - it's a convenience to help users install the completion scripts.
 */
export function setupCompletionsCommand(program: Program): void {
  program
    .command('completions', 'Generate shell completions')
    .argument('<shell>', 'Shell type (zsh, bash, fish)', {
      validator: program.STRING,
    })
    .action(async ({ args, logger }) => {
      const shell = args.shell as ShellType;
      logger.debug('Generating completions for shell: %s', shell);

      try {
        // When generating completion scripts, we need to output raw text
        // without any logger formatting or prefixes so it can be redirected to a file

        // Output the completion script to stdout
        // This allows users to redirect it to a file
        // Example: defuddle completions zsh > ~/.zsh/completions/_defuddle

        // For demonstration purposes, we're outputting a simple script
        // In a real implementation, we would use tabtab's API to generate the script
        console.log(`# Shell completion script for defuddle (${shell})`);
        console.log(`# Generated on ${new Date().toISOString()}`);
        console.log('# This script enables tab completion for the defuddle CLI');
        console.log('');

        // Add shell-specific completion code
        switch (shell) {
          case 'bash':
            console.log('# Bash completion script');
            console.log('_defuddle_completions() {');
            console.log(
              '  COMPREPLY=($(compgen -W "help completions validate info" -- "${COMP_WORDS[COMP_CWORD]}"))'
            );
            console.log('}');
            console.log('complete -F _defuddle_completions defuddle');
            break;
          case 'zsh':
            console.log('# Zsh completion script');
            console.log('#compdef defuddle');
            console.log('_defuddle() {');
            console.log('  local -a commands');
            console.log(
              '  commands=("help:Show help" "completions:Generate shell completions" "validate:Validate HTML" "info:Display metadata")'
            );
            console.log('  _describe -t commands "defuddle commands" commands');
            console.log('}');
            console.log('_defuddle "$@"');
            break;
          case 'fish':
            console.log('# Fish completion script');
            console.log('function __fish_defuddle_commands');
            console.log('  echo help\tShow help');
            console.log('  echo completions\tGenerate shell completions');
            console.log('  echo validate\tValidate HTML');
            console.log('  echo info\tDisplay metadata');
            console.log('end');
            console.log('complete -f -c defuddle -a "(__fish_defuddle_commands)"');
            break;
        }

        // Log instructions to stderr so they don't interfere with redirection
        console.error(chalk.green(`\n${shell} completion script generated.`));
        console.error(chalk.yellow(`To use, add it to your ${shell} configuration:`));

        const programName = 'defuddle';
        switch (shell) {
          case 'bash':
            console.error(
              chalk.yellow(
                `  ${programName} completions bash > ~/.bash_completion.d/${programName}`
              )
            );
            console.error(
              chalk.yellow(`  echo 'source ~/.bash_completion.d/${programName}' >> ~/.bashrc`)
            );
            break;
          case 'zsh':
            console.error(
              chalk.yellow(`  ${programName} completions zsh > ~/.zsh/completions/_${programName}`)
            );
            console.error(
              chalk.yellow('  # Make sure ~/.zsh/completions is in your fpath before compinit')
            );
            break;
          case 'fish':
            console.error(
              chalk.yellow(
                `  ${programName} completions fish > ~/.config/fish/completions/${programName}.fish`
              )
            );
            break;
        }

        // Suggest using the built-in installation command
        console.error(chalk.blue('\nAlternatively, you can use the automatic installation:'));
        console.error(chalk.blue(`  ${programName} --install-completion`));
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === 'object' && 'message' in error
            ? (error as { message?: string }).message
            : 'An unknown error occurred';
        logger.error(chalk.red(`Error: ${errorMessage || 'An unknown error occurred'}`));
        process.exit(1);
      }
    });
}
