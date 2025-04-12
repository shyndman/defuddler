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

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. Please see our [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) for detailed guidelines.

Following this convention is important because:

1. It automatically determines the next version number
2. It generates the CHANGELOG.md file
3. It helps organize and categorize changes

We enforce this convention using commitlint, which will check your commit messages automatically. If your commit message doesn't follow the convention, it will be rejected. Our CI pipeline also verifies that all commits in a pull request follow the conventional commit format.

Examples of good commit messages:

```
feat(cli): add support for custom user agents
fix(parser): resolve issue with malformed HTML
docs(readme): update installation instructions
```

### Interactive Commit Helper

We've added a tool to help you create properly formatted commit messages. Instead of using `git commit`, you can run:

```bash
pnpm run commit
```

This will launch an interactive prompt that will guide you through creating a conventional commit message.

### Manual Validation

To manually check if your commit message is valid before committing, you can run:

```bash
pnpm run commit-msg-lint
```

## Pull Requests

- Provide a clear description of the changes
- Link to any related issues
- Ensure all CI checks pass
- Make sure all commits in your PR follow the [conventional commit format](./COMMIT_CONVENTION.md)
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
