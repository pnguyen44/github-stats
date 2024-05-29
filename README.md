# github-stats

Generates reports using data fetched from GitHub API.

## prerequisite

This project pulls in data from GitHub using the GitHub API. You need to generate a token in order to use the API.

To generate a token, please follow the instructions in the [GitHub docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#keeping-your-personal-access-tokens-secure).

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
