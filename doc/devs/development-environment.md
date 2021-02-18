# How Blurt is [made](https://www.facebook.com/watch/?v=845703122288697)

Use Clion when working on Blurt.  It will make your life far easier.  

## Clion - Macos

MAC!  IT BUILDS ON MAC!
You'll need some things:
* Make sure that you did not install Boost using homebrew.  That'll override conan's built version of Boost, and Blurt will not build.
* [IPFS](https://ipfs.io):  Install it and do like `mkdir ~/.blurtd && ipfs get -o ~/.blurtd/snapshot.json QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu`
* Blurt source code: `git clone https://gitlab.com/blurt/blurt`
* Xcode:  `xcode-select --install`
* Rosary: Three hail marys, please
* [conan](https://conan.io): `brew install conan`
* Ccache: `brew install ccache`


OK so what's going to happen here is Conan will be a package manager kind of like npm.  It'll install a ton of stuff, and likely, blurt will build!

How cool is that?


```



rm -rf ~/.conan/data
conan install --build missing -pr default ..
cmake ..
make blurtd cli_wallet
6912  ls
6913  cmake ..
6914  cat CMakeFiles/CMakeError.log
6915  xcode-select --install
6916  cmake ..
6917  conan install --help
6918  rm -rf ~/.conan/data
6919  conan install ..
6920  conan install --build missing ..
6921* brew uninstall boost
6922* brew uninstall opencv
6923* brew uninstall boost
6924* brew uninstall vtk
6925* brew uninstall boost
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
6949* conan install --build missing ..
6950* cmake ..
6951* make
6952* cat ~/.conan/profiles/default
6953* cd ..
6954* cd build-dev
6955* rm -rf *
6956* conan install --build missing -pr default ..
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
6974* rm -rf ~/.conan/data
6975* conan install .. -pr=default --build=missing
```

 




## Clion - Linux

Stuff about setting up blurt builds on Linux
