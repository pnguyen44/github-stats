# github-stats

Generates reports using data fetched from GitHub API.

## pre-commit

### Install pre-commit

```sh
brew install pre-commit
```

### Set up the git hook scripts

```sh
pre-commit install
```

## Configs

This project uses configurations pulled from a `config.json` file. Please create this file with the contents in the `config.example.json` file and update it as needed.

```sh
cp src/config.example.json src/config.json
```

## Generate reports

**Note:** Requires steps detailed in the [configs](#configs) section.

```sh
npm run start

```

## Run tests

```sh
npm run test
```
