#!/usr/bin/env python3
import argparse
import requests
import time
import sys

DNS_API = 'https://dns.google/resolve'

parser = argparse.ArgumentParser(description='Check domain A records and site availability')
parser.add_argument('--domain', required=True)
parser.add_argument('--ips', nargs='+', required=True, help='Expected IP addresses (space separated)')
parser.add_argument('--interval', type=int, default=300, help='Polling interval seconds')
parser.add_argument('--timeout', type=int, default=3600, help='Total timeout seconds')
args = parser.parse_args()

start = time.time()
print(f"Checking domain {args.domain} for A records: {args.ips}")

while True:
    elapsed = time.time() - start
    if elapsed > args.timeout:
        print('Timed out waiting for domain to resolve')
        sys.exit(2)
    try:
        r = requests.get(DNS_API, params={'name': args.domain, 'type': 'A'}, timeout=10)
        r.raise_for_status()
        j = r.json()
        answers = j.get('Answer', [])
        found_ips = set()
        for a in answers:
            data = a.get('data')
            if data:
                found_ips.add(data.strip())
        print('Found A records:', ','.join(sorted(found_ips)) or '(none)')
        if any(ip in found_ips for ip in args.ips):
            print('Expected IP found in DNS, checking HTTPS...')
            try:
                https_r = requests.get('https://' + args.domain, timeout=15, allow_redirects=True)
                print('HTTPS status:', https_r.status_code)
                if https_r.status_code < 400:
                    print('Site responding over HTTPS — domain appears live')
                    sys.exit(0)
                else:
                    print('Site returned status >=400; may not be fully provisioned yet')
            except Exception as e:
                print('HTTPS check failed:', e)
        else:
            print('Expected IP not yet present')
    except Exception as e:
        print('DNS query failed:', e)

    time.sleep(args.interval)