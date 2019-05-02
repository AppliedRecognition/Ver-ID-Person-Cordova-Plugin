#!/bin/sh

cd www
tsc -p tsconfig.json
typedoc --excludeNotExported --excludePrivate --mode modules --out ../docs/ Ver-ID.ts
cd ..