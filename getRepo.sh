TOKEN=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
ENDPOINT=repos/simplisafe/bender

curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/$ENDPOINT
