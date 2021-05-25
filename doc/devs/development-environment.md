# How Blurt is [made](https://www.facebook.com/watch/?v=845703122288697)

Use Clion when working on Blurt. It will make your life far easier.

## Clion - Macos

MAC! IT BUILDS ON MAC!
You'll need some things:


- [IPFS](https://ipfs.io): Install it and do like `mkdir ~/.blurtd && ipfs get -o ~/.blurtd/snapshot.json QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu`
- Blurt source code: `git clone https://gitlab.com/blurt/blurt`
- Xcode: `xcode-select --install`
- Rosary: Three hail marys, please
- Ccache: `brew install ccache`

OK so what's going to happen here is Hunter will be a package manager kind of like npm. It'll install a ton of stuff, and likely, blurt will build!

How cool is that?

```




cmake ..
make blurtd cli_wallet
6912  ls
6913  cmake ..
6915  xcode-select --install
6916  cmake ..
6926  cmake ..
6927  make
6928  ls
6929  cd bin
6930  ls
6931  cd ..
6932  cd blurtd
6933  cd bin
6934  ./blurtd
6935  ipfs get --help
6936  ipfs get -o ~/.blurtd/snapshot.json QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu
6937  ./blurtd
6938  ./blurtd --help
6939  ./blurtd --resync-blockchain
6940* htop
6941* git fetch
6942* git pull
6943* git stash
6944* git pull
6945* git checkout dev
6946* git pull
6947* mkdir build-dev
6948* cd build-dev
6950* cmake ..
6951* make
6953* cd ..
6954* cd build-dev
6955* rm -rf *
6957* make blurtd
6958* make -j 4
6959* cmake ..
6960* make -j 4
6961  env
6962* cd blurt-dev
6963* git pull
6964* git checkout hf3-jga
6965* mkdir hf3-jga-build
6966* cd hf3-jga-build
6967* ls
6968* xcode-select --install
6969* xcode-select
6970* xcode-select -v
6971* cd ..
6972* mkdir build-jga
6973* cd build-jga
```

## Clion - Linux

Stuff about setting up blurt builds on Linux
