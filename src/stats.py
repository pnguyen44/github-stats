from github import Github

TOKEN = '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'
g = Github(TOKEN)

def get_repos():
    try:
        repos = g.get_repos()
        for r in repos:
            print(r.name)

    except Exception as e:
        print(f'Error in fetching repos: {e}')

get_repos()
