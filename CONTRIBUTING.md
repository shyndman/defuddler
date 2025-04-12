# Contributing to Defuddler

Thank you for considering contributing to Defuddler! This document outlines the process for contributing to the project and the standards we expect.

## Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure all checks pass
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Code Standards

### TypeScript

- Use TypeScript for all code
- Ensure all code passes the TypeScript compiler (`pnpm run typecheck`)
- Use proper typing and avoid using `any` when possible

### Formatting and Linting

- All code must pass ESLint checks (`pnpm run lint`)
- All code must pass Prettier formatting checks (`pnpm run format:check`)
- You can automatically format your code with `pnpm run format`

### Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting a PR (`pnpm run test`)

## Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in the present tense (e.g., "Add feature" not "Added feature")
- Reference issue numbers when applicable (e.g., "Fix #123: Resolve memory leak")

## Pull Requests

- Provide a clear description of the changes
- Link to any related issues
- Ensure all CI checks pass
- Be responsive to feedback and be willing to make requested changes

## Development Setup

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Run `pnpm run dev` to start the development server with watch mode

## Pre-commit Hooks

The project uses Husky to run pre-commit and pre-push hooks:

- Pre-commit: Runs linting and type checking on staged files
- Pre-push: Runs linting, type checking, and tests on all files

These hooks help ensure code quality before changes are committed or pushed.

## License

By contributing to Defuddler, you agree that your contributions will be licensed under the project's MIT License.
