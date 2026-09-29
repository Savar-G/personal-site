#!/bin/bash
# usage: gen.sh name aspect "prompt"
cd "$(dirname "$0")"
name=$1; ar=$2; prompt=$3
payload=$(python3 -c 'import json,sys;print(json.dumps({"model":"gemini-3-pro-image-preview","image_size":"2K","aspect_ratio":sys.argv[1],"prompt":sys.argv[2]}))' "$ar" "$prompt")
for try in 1 2; do
  composio execute GEMINI_GENERATE_IMAGE -d "$payload" > "gen/$name.json" 2>&1
  url=$(python3 -c 'import json,sys;d=json.load(open(sys.argv[1]));print(((d.get("data") or {}).get("image") or {}).get("s3url",""))' "gen/$name.json" 2>/dev/null)
  if [ -n "$url" ]; then curl -sL "$url" -o "gen/$name.jpg" && echo "OK $name" && exit 0; fi
done
echo "FAIL $name"; head -c 400 "gen/$name.json"
