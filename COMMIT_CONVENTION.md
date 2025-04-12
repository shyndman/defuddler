# Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/), a specification for adding human and machine-readable meaning to commit messages.

## Format

Each commit message consists of a **header**, a **body**, and a **footer**. The header has a special format that includes a **type**, an optional **scope**, and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

## Types

The commit type must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Scope

The scope is optional and should be a noun describing a section of the codebase:

Examples:
- `feat(parser)`: A new feature in the parser
- `fix(cli)`: A bug fix in the CLI
- `docs(readme)`: Documentation changes in the README

## Subject

The subject contains a succinct description of the change:
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end

## Body

The body should include the motivation for the change and contrast this with previous behavior.

## Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

Breaking Changes should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

## Examples

```
feat(cli): add user-agent command

Add a new command to specify and inject user agents into requests

Closes #123
```

```
fix(parser): handle edge case in HTML parsing

Resolves an issue where certain malformed HTML would cause the parser to crash

Fixes #456
```

```
feat(api): change authentication method

BREAKING CHANGE: The authentication API has changed.
Users need to update their authentication flow.

Closes #789
```

## Automatic Versioning

This project uses semantic-release to automatically determine the next version number based on the commit messages:

- `fix` type commits trigger a PATCH release (e.g., 1.0.0 → 1.0.1)
- `feat` type commits trigger a MINOR release (e.g., 1.0.0 → 1.1.0)
- Commits with `BREAKING CHANGE` in the footer trigger a MAJOR release (e.g., 1.0.0 → 2.0.0)

Multiple commits of the same type are grouped in the generated changelog.
