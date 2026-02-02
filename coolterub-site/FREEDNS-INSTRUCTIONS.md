FreeDNS setup instructions

1. Sign in or create an account at https://freedns.afraid.org/.
2. Add a subdomain under your account (for example: `myname.example.freeddns.afraid.org`).
3. Point that subdomain to the web host of this site. If you are using GitHub Pages, add a `CNAME` file to the `coolterub-site/` directory containing only your hostname, e.g.:

   myname.example.freeddns.afraid.org

4. Push the `CNAME` file to your repository and enable GitHub Pages for the branch/folder you want (usually `gh-pages` or `main` + `/docs` or `/`).

Automating CNAME file creation (script)

- A helper script `setup_freedns.sh` is included in this directory to create the `CNAME` file for you and optionally commit & push it to git.

  Usage examples:

  - Prompted mode:

      cd coolterub-site
      chmod +x setup_freedns.sh
      ./setup_freedns.sh

    The script will ask for the hostname and whether to commit & push.

  - One-shot mode (non-interactive):

      cd coolterub-site
      chmod +x setup_freedns.sh
      ./setup_freedns.sh myname.example.freeddns.afraid.org

- If you choose to commit & push from the script, ensure you are on the correct branch and have push access configured (SSH or HTTPS credentials).

Notes and security

- The script only creates the `CNAME` file and does NOT perform any actions on your FreeDNS account. Creating or registering the subdomain on FreeDNS usually requires you to add the entry via the FreeDNS web UI and/or use their API with account credentials.
- Do not store account passwords or API keys in plaintext inside repositories. If you need to automate FreeDNS account actions, review FreeDNS's API docs and prefer using securely stored tokens or environment variables.
- I added `CNAME.example` as a placeholder. When you tell me the exact FreeDNS hostname you want, I can add a real `CNAME` file in this directory for you.
- DNS changes can take some time to propagate (minutes to hours).