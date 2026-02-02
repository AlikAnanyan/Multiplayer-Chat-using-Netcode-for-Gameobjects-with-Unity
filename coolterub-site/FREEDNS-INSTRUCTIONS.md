FreeDNS setup instructions

1. Sign in or create an account at https://freedns.afraid.org/.
2. Add a subdomain under your account (for example: `myname.example.freeddns.afraid.org`).
3. Point that subdomain to the web host of this site. If you are using GitHub Pages, add a `CNAME` file to the `coolterub-site/` directory containing only your hostname, e.g.:

   myname.example.freeddns.afraid.org

4. Push the `CNAME` file to your repository and enable GitHub Pages for the branch/folder you want (usually `gh-pages` or `main` + `/docs` or `/`).

Apex domain (root / example.com) setup with A records

- If you want to use an **apex domain** (for example: `Albertcoolter.pl`) you should create A records at your DNS provider that point the domain to GitHub Pages' IP addresses:

  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153

- After adding the A records, create a `CNAME` file in your published site branch (for example, in the `gh-pages` branch root) containing the single line `Albertcoolter.pl`. Then enable the custom domain in the repository Pages settings or wait for GitHub Pages to detect the `CNAME` file automatically.

Cloudflare / Worker-backed hosting (alternative)

- If you prefer to serve the site via the Cloudflare Worker proxy, you can keep the apex domain pointed to Cloudflare's DNS and add a route in Cloudflare (or use a CNAME/flattening) to forward to the Worker or to GitHub Pages. See `proxy-worker/README.md` for details.

- For apex domains some DNS providers support ALIAS/ANAME records; if yours does, you can use those instead of multiple A records.

Notes:
- DNS changes can take some time to propagate (minutes to hours). If you want me to add the `CNAME` file for `Albertcoolter.pl` to the published branch now, say "Add CNAME to gh-pages" and I will add it and verify the Pages settings.

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