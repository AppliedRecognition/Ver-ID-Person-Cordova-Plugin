#!/bin/sh

rm -rf docs
cd www
tsc -p tsconfig.json
typedoc --excludeNotExported --excludePrivate --mode modules --out ../docs/ Ver-ID.ts
cd ..
touch docs/.nojekyll