# Requirements:

- Bun
- Go
- Npm
- Git

### Notes

`Once bun is running, npm will not work`
## File hierarchy
xx_network/
 - client
 - ekv
 - xxdk-wasm
 - haven (fix-stuck branch)
 - extension
Clone all above repos,
and move to following branches on all except haven and extension which uses the `fix-stuck` branch ⟶
```bash
git checkout 11-22-implement-kv-interface-defined-in-collectiveversionedkvgo
```
Adjustments for local testing
### 1. replace go.mod for local testing
IN XXDK WASM REPLACE IN GO.MOD FILE, by putting it at the end of the linebreak
```go
replace gitlab.com/elixxir/client/v4 => ../client
replace gitlab.com/elixxir/ekv => ../ekv
```
IN CLIENT FOLLDER REPLACE IN GO.MOD FILE, by putting it at the end of the linebreak
```go
replace gitlab.com/elixxir/ekv => ../ekv
```

### 2. In your $HOME path you adjust your .gitconfig file
Run in your terminal:
```bash
sudo vim ~/.gitconfig
```
and add at the bottom:
```
[url "https://git.xx.network/elixxir"]
        insteadOf = https://gitlab.com/elixxir
        insteadOf = https://git.xx.network/elixxir
[url "https://git.xx.network/xx_network"]
        insteadOf = https://gitlab.com/xx_network
        insteadOf = https://git.xx.network/xx_network
```

### 3. Update files from telegram
dm.ts -> xxdk-wasm src/events/dm.ts

webpack.config.js xxdk-wasm

tsconfig.json xxdk-wasm

### 4. Run build & link
Go to your xxdk-wasm folder:
```bash
cd ../xxdk-wasm
```

Run this once in the xxdk-wasm folder:
```bash
npm i && npm run build && bun link
```

Go back to your haven folder:
```bash
cd ../haven
```
Run this
```bash
bun link xxdk-wasm
```


### 4. Run dev server in Haven
```bash
npm run dev
```
