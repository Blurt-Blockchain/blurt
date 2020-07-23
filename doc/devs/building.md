# Building Blurt

Blurt is designed to be compiled on GitLab.  By using `ccache` in our build process, we have been able to reduce compile times for Blurt from as high as 3 hours when using shared GitLab Runners to as little as 3 minutes when using our own runners with the following spec:

* AMD Ryzen 9 3900 12 Cores "Matisse" (Zen2)
* 128 GB DDR4 ECC RAM
* 2 x 1.92 TB NVMe SSD Datacenter Edition (Software-RAID 1)
* 1 Gbit/s bandwidth

If you're working on Blurt and you'd like to use our infrastructure to compile your builds, please just e-mail info@blurt.foundation or create an issue, and we will get you set up on a branch.  

We're shooting for 1-2 minute compile times in the end, so that we can achieve the highest level of developer productivity.  We are mainly taking advice from these  articles:

[Ccache for Gitlab CI](https://gould.cx/ted/blog/2017/06/10/ccache-for-Gitlab-CI/)
[Faster C Builds](https://www.bitsnbites.eu/faster-c-builds/)
[12 Steps to Better Code](https://www.joelonsoftware.com/2000/08/09/the-joel-test-12-steps-to-better-code/)

If you would like to compile Blurt locally, you can do that as well!  Our .gitlab-ci.yml file provides a clear description of how to set up a Blurt devleopment environment on Debian 10.  

If you fork Blurt into another GitLab repository, the build system is complete and will be reasonably fast after the first build, even on shared GitLab runners.   Note that you may need to extend the timeout to 3 hours for the first build if using shared GitLab runners. 

**Please upstream changes!**

## Compile-Time Options (cmake)

### CMAKE_BUILD_TYPE=[Release/Debug]

Specifies whether to build with or without optimization and without or with
the symbol table for debugging. Unless you are specifically debugging or
running tests, it is recommended to build as release.

### LOW_MEMORY_NODE=[OFF/ON]

Builds blurtd to be a consensus-only low memory node. Data and fields not
needed for consensus are not stored in the object database.  This option is
recommended for witnesses and seed-nodes.

### CLEAR_VOTES=[ON/OFF]

Clears old votes from memory that are no longer required for consensus.

### BUILD_BLURT_TESTNET=[OFF/ON]

Builds blurt for use in a private testnet. Also required for building unit tests.

### SKIP_BY_TX_ID=[OFF/ON]

By default this is off. Enabling will prevent the account history plugin querying transactions 
by id, but saving around 65% of CPU time when reindexing. Enabling this option is a
huge gain if you do not need this functionality.

## Building under Docker

We ship a [Dockerfile](https://gitlab.com/blurt/docker).  This builds both common node type binaries.

## Building on macOS X

Install Xcode and its command line tools by following the instructions here:
https://guide.macports.org/#installing.xcode.  In OS X 10.11 (El Capitan)
and newer, you will be prompted to install developer tools when running a
developer command in the terminal.

Accept the Xcode license if you have not already:

    sudo xcodebuild -license accept

Install Homebrew by following the instructions here: http://brew.sh/

### Initialize Homebrew:

    brew doctor
    brew update

### Install Blurt dependencies:

```bash
    brew install \
        autoconf \
        automake \
        cmake \
        git \
        boost160 \
        libtool \
        openssl \
        snappy \
        zlib \
        bzip2 \
        python3
        
    pip3 install --user jinja2
```

### Clone the Repository

```bash
    git clone https://gitlab.com/blurt/blurt
    cd blurt
```

### Compile
This works on the very latest and most shiny Mac OSX 10.15.6.  

Your mileage may vary on other versions.  If you ever want to know if your code changes will build, probably a good idea to create a new branch and let CI do the work.  

    git checkout dev
    git submodule update --init --recursive
    mkdir build && cd build
    conan install .. -s compiler=apple-clang -s compiler.version=11.0 -s compiler.libcxx=libc++ -if=. -pr=default --build=missing
    cmake -DBLURT_STATIC_BUILD=ON -DLOW_MEMORY_NODE=OFF -DCLEAR_VOTES=OFF -DBUILD_BLURT_TESTNET=OFF -DSKIP_BY_TX_ID=OFF -DBLURT_LINT_LEVEL=OFF -DENABLE_MIRA=OFF -DCMAKE_BUILD_TYPE=Release ..
    make -j$(sysctl -n hw.logicalcpu)
    
.....but this fails.  So, if you know how to make it not-fail, submit an MR right here please!

Also, some useful build targets for `make` are:

    blurtd
    chain_test
    cli_wallet

e.g.:

    make -j$(sysctl -n hw.logicalcpu) blurtd

This will only build `blurtd`.

## Building on Other Platforms

- The developers normally compile with gcc and clang. These compilers should
  be well-supported.
- Community members occasionally attempt to compile the code with mingw,
  Intel and Microsoft compilers. These compilers may work, but the
  developers do not use them. Pull requests fixing warnings / errors from
  these compilers are accepted.

### gitpod.io

This is a free-to-use online development environment and for our project is 
free as it is open source.

It does have a small limitation - `gcc` version 9.3. so, keep in mind for 
now while the build is being fixed to work on gitpod, this is the notes for 
how to do it.

```bash
mkdir build && cd build
pip install conan
conan install .. -s compiler=gcc -s compiler.version=9.3 -s compiler.libcxx=libstdc++ -if=. -pr=default --build=missing
cmake -DBLURT_STATIC_BUILD=ON -DLOW_MEMORY_NODE=OFF -DCLEAR_VOTES=OFF -DBUILD_BLURT_TESTNET=OFF -DSKIP_BY_TX_ID=OFF -DBLURT_LINT_LEVEL=OFF -DENABLE_MIRA=OFF -DCMAKE_BUILD_TYPE=Release ..
make -j$(nproc)
```

Regarding building with clang:

```ini
  GNU nano 4.8                                                                                       /home/loki/.conan/profiles/default                                                                                                 
[settings]
os=Linux
os_build=Linux
arch=x86_64
arch_build=x86_64
compiler=clang
compiler.version=10
compiler.libcxx=libstdc++11
build_type=Release
[options]
[build_requires]
[env]
CC=/usr/bin/clang
CXX=/usr/bin/clang++
CONAN_CPU_COUNT=1
```

Note that the cpu count option is set to 1 while there is source 
files that are too big to compile on a 4gb machine. If it is set 
to a single job it can get through it using swap... slowly...