#!/usr/bin/env bash
set -euo pipefail

# setup_freedns.sh
# Creates a CNAME file in this directory for GitHub Pages + FreeDNS and optionally commits & pushes it.
# Usage:
#   ./setup_freedns.sh myname.example.freeddns.afraid.org
#   or run without args and the script will prompt.

DIR="$(cd "$(dirname "$0")" && pwd)"
CNAME_FILE="$DIR/CNAME"

HOSTNAME="${1:-}"
if [ -z "$HOSTNAME" ]; then
  read -rp "Enter FreeDNS hostname (e.g. myname.example.freeddns.afraid.org): " HOSTNAME
fi

if [ -z "$HOSTNAME" ]; then
  echo "No hostname supplied. Exiting." >&2
  exit 1
fi

# Write the CNAME file
printf "%s\n" "$HOSTNAME" > "$CNAME_FILE"
chmod 0644 "$CNAME_FILE" || true
echo "Wrote CNAME -> $CNAME_FILE"

# Offer to commit & push
read -rp "Commit & push the CNAME to git (in $DIR)? [y/N]: " RESP
if [[ "$RESP" =~ ^[Yy]$ ]]; then
  if ! git -C "$DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Not a git repo: $DIR. Please run this from inside a git repository if you want to commit." >&2
  else
    git -C "$DIR" add CNAME
    if git -C "$DIR" commit -m "Add CNAME for CoolterUB: $HOSTNAME"; then
      echo "Committed. Pushing..."
      if git -C "$DIR" push; then
        echo "Pushed successfully."
      else
        echo "Push failed. Check your remote/credentials." >&2
      fi
    else
      echo "Nothing to commit or commit failed." >&2
    fi
  fi
fi

cat <<'NOTE'
Done.
- The script only creates the `CNAME` file and can commit it to git if requested.
- You still need to create the subdomain in your FreeDNS account (https://freedns.afraid.org/) and point/allow it to your site.
- For privacy/security reasons, this script does NOT attempt to automate FreeDNS account actions (those require account credentials/API tokens and manual steps).
NOTE