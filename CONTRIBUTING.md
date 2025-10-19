# Contributing to DEB8

Thank you for your interest in contributing to DEB8! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Add upstream remote: `git remote add upstream <original-repo-url>`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-voting-system`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/debate-room-logic`)
- `test/` - Adding or updating tests (e.g., `test/add-auth-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT token refresh mechanism

fix(debate): resolve socket disconnection issue

docs(readme): update installation instructions
```

### Code Style

- Follow the existing code style
- Use ESLint for JavaScript linting
- Use Prettier for code formatting (if configured)
- Write meaningful variable and function names
- Add comments for complex logic

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Run `npm run lint` to check for linting errors

### Pull Request Process

1. **Update your branch** with the latest changes from upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure your code works**:
   - Test locally
   - Run linting: `npm run lint`
   - Build successfully: `npm run build`

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template with:
     - Description of changes
     - Related issue numbers (if any)
     - Screenshots (if UI changes)
     - Testing steps

5. **Address review comments**:
   - Make requested changes
   - Push updates to the same branch
   - Respond to reviewer comments

### PR Title Format

```
<type>(<scope>): <description>
```

Example: `feat(polls): add real-time poll results`

## Code Review Guidelines

### For Contributors
- Be open to feedback
- Respond to comments promptly
- Keep PRs focused and small
- Update documentation if needed

### For Reviewers
- Be respectful and constructive
- Explain the reasoning behind suggestions
- Approve when ready or request changes clearly
- Test the changes locally if possible

## Project Structure

```
DEB8-main/
├── public/          # Static assets
├── server/          # Backend code
│   ├── models/      # Database models
│   ├── routes/      # API routes
│   └── index.js     # Server entry point
├── src/             # Frontend code
│   ├── api/         # API clients
│   ├── components/  # Reusable components
│   ├── context/     # React context providers
│   ├── pages/       # Page components
│   └── ...
└── ...
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure your environment variables
3. Install dependencies: `npm install`
4. Start MongoDB
5. Run development servers:
   - Frontend: `npm run dev`
   - Backend: `npm run server`

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, etc.)

## Feature Requests

- Check if the feature already exists
- Search existing issues/PRs
- Provide clear use case and benefits
- Be open to discussion and alternatives

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
