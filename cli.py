import requests
import argparse

BASE_URL = "https://incident-api-10665824183.us-central1.run.app"

def create(args):
    res = requests.post(f"{BASE_URL}/incidents", json={
        "title": args.title,
        "description": args.description,
        "severity": args.severity
    })
    print(res.status_code)
    print(res.text)

def list_incidents(args):
    res = requests.get(f"{BASE_URL}/incidents")
    print(res.status_code)
    print(res.text)
    #print(res.json())

def resolve(args):
    requests.patch(f"{BASE_URL}/incidents/{args.id}", params={"status": "resolved"})
    res = requests.patch(...)
    print(res.status_code)
    print(res.text)

parser = argparse.ArgumentParser()
subparsers = parser.add_subparsers()

create_parser = subparsers.add_parser("create")
create_parser.add_argument("--title")
create_parser.add_argument("--description")
create_parser.add_argument("--severity")
create_parser.set_defaults(func=create)

list_parser= subparsers.add_parser("list")
list_parser.set_defaults(func=list_incidents)

resolve_parser = subparsers.add_parser("resolve")
resolve_parser.add_argument("id")
resolve_parser.set_defaults(func=resolve)

args = parser.parse_args()
args.func(args)