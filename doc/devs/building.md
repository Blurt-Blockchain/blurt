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

### Install steem dependencies:

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
    
Note: brew recently updated to boost 1.61.0, which is not yet supported by
steem. Until then, this will allow you to install boost 1.60.0.
You may also need to install zlib and bzip2 libraries manually.
In that case, change the directories for `export` accordingly.

*Optional.* To use TCMalloc in LevelDB:

    brew install google-perftools

*Optional.* To use cli_wallet and override macOS's default readline installation:

    brew install --force readline
    brew link --force readline

### Clone the Repository

    git clone https://github.com/steemit/steem.git
    cd steem

### Compile

    export BOOST_ROOT=$(brew --prefix)/Cellar/boost@1.60/1.60.0/
    export OPENSSL_ROOT_DIR=$(brew --prefix)/Cellar/openssl/1.0.2q/
    export SNAPPY_ROOT_DIR=$(brew --prefix)/Cellar/snappy/1.1.7_1
    export ZLIB_ROOT_DIR=$(brew --prefix)/Cellar/zlib/1.2.11
    export BZIP2_ROOT_DIR=$(brew --prefix)/Cellar/bzip2/1.0.6_1
    git checkout stable
    git submodule update --init --recursive
    mkdir build && cd build
    cmake -DBOOST_ROOT="$BOOST_ROOT" -DCMAKE_BUILD_TYPE=Release ..
    make -j$(sysctl -n hw.logicalcpu)

Also, some useful build targets for `make` are:

    blurtd
    chain_test
    cli_wallet

e.g.:

    make -j$(sysctl -n hw.logicalcpu) blurtd

This will only build `blurtd`.

## Building on Other Platforms

- Windows build instructions do not yet exist, and likely never will.
- The developers normally compile with gcc and clang. These compilers should
  be well-supported.
- Community members occasionally attempt to compile the code with mingw,
  Intel and Microsoft compilers. These compilers may work, but the
  developers do not use them. Pull requests fixing warnings / errors from
  these compilers are accepted.