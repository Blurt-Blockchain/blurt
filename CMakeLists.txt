cmake_minimum_required( VERSION 3.20 )
include(cmake/HunterGate.cmake)


HunterGate(
    URL "https://github.com/faddat/hunter/archive/refs/tags/four.tar.gz"
    SHA1 "ee0585f7d592bf276a674816ece9cb83c59bedfb"
)

# Defines Blurt library target.
project( Blurt )

find_program(CCACHE_FOUND ccache)
if(CCACHE_FOUND)
    set_property(GLOBAL PROPERTY RULE_LAUNCH_COMPILE ccache)
    set_property(GLOBAL PROPERTY RULE_LAUNCH_LINK ccache) 
endif(CCACHE_FOUND)

hunter_add_package(Boost COMPONENTS thread regex date_time system filesystem program_options iostreams test serialization chrono context locale coroutine program_options)
hunter_add_package(ZLIB)
hunter_add_package(BZip2)
hunter_add_package(zstd)
hunter_add_package(websocketpp)
hunter_add_package(readline)
hunter_add_package(rocksdb)
hunter_add_package(OpenSSL)



find_package(ZLIB CONFIG REQUIRED)
find_package(Boost CONFIG REQUIRED thread regex date_time system filesystem program_options iostreams serialization chrono context coroutine program_options)
find_package(BZip2 CONFIG REQUIRED)
find_package(zstd CONFIG REQUIRED)
find_package(websocketpp CONFIG REQUIRED)
find_package(RocksDB CONFIG REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(readline REQUIRED)


include_directories(
   "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>"
   "$<INSTALL_INTERFACE:include>"
 )


# Configure the chain
set( BLOCKCHAIN_NAME "Blurt" )
set( CMAKE_CXX_STANDARD 14 )
set( GUI_CLIENT_EXECUTABLE_NAME Blurt )
set( CUSTOM_URL_SCHEME "gcs" )
set( INSTALLER_APP_ID "68ad7005-8eee-49c9-95ce-9eed97e5b347" )
set( CMAKE_EXPORT_COMPILE_COMMANDS "ON" )

list( APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/libraries/fc/CMakeModules" )
list( APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/libraries/fc/GitVersionGen" )
include( GetGitRevisionDescription )
get_git_head_revision( GIT_REFSPEC GIT_SHA2 )

SET( Boost_USE_STATIC_LIBS ON CACHE STRING "ON or OFF" )

OPTION( BUILD_BLURT_TESTNET "Build source for test network (ON OR OFF)" OFF )
MESSAGE( STATUS "BUILD_BLURT_TESTNET: ${BUILD_BLURT_TESTNET}" )
if( BUILD_BLURT_TESTNET  )
  MESSAGE( STATUS "     " )
  MESSAGE( STATUS "             CONFIGURING FOR TEST NET             " )
  MESSAGE( STATUS "     " )
  SET( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DIS_TEST_NET")
  SET( CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DIS_TEST_NET" )
endif()

OPTION( ENABLE_MIRA "Build source with MIRA (ON OR OFF)" OFF )
MESSAGE( STATUS "ENABLE_MIRA: ${ENABLE_MIRA}" )
if( ENABLE_MIRA )
  MESSAGE( STATUS "     " )
  MESSAGE( STATUS "             CONFIGURING FOR MIRA             " )
  MESSAGE( STATUS "     " )
  SET( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DENABLE_MIRA" )
  SET( CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DENABLE_MIRA" )
endif()

OPTION( LOW_MEMORY_NODE "Build source for low memory node (ON OR OFF)" OFF )
MESSAGE( STATUS "LOW_MEMORY_NODE: ${LOW_MEMORY_NODE}" )
if( LOW_MEMORY_NODE )
  MESSAGE( STATUS "     " )
  MESSAGE( STATUS "             CONFIGURING FOR LOW MEMORY NODE      " )
  MESSAGE( STATUS "     " )
  SET( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DIS_LOW_MEM" )
  SET( CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DIS_LOW_MEM" )
endif()

OPTION( CHAINBASE_CHECK_LOCKING "Check locks in chainbase (ON or OFF)" ON )
MESSAGE( STATUS "CHAINBASE_CHECK_LOCKING: ${CHAINBASE_CHECK_LOCKING}" )

if( CHAINBASE_CHECK_LOCKING )
  SET( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DCHAINBASE_CHECK_LOCKING" )
  SET( CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DCHAINBASE_CHECK_LOCKING" )
endif()

OPTION( CLEAR_VOTES "Build source to clear old votes from memory" ON )
if( CLEAR_VOTES )
  MESSAGE( STATUS "   CONFIGURING TO CLEAR OLD VOTES FROM MEMORY" )
  SET( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DCLEAR_VOTES" )
  SET( CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DCLEAR_VOTES" )
endif()

OPTION( SKIP_BY_TX_ID "Skip ordering operation history by transaction id (ON or OFF)" OFF )
MESSAGE( STATUS "SKIP_BY_TX_ID: ${SKIP_BY_TX_ID}" )
if( SKIP_BY_TX_ID )
   SET( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DSKIP_BY_TX_ID" )
   SET( CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DSKIP_BY_TX_ID" )
endif()

OPTION( BLURT_STATIC_BUILD "Build blurtd as a static library (ON or OFF)" ON )
MESSAGE( STATUS "BLURT_STATIC_BUILD: ${BLURT_STATIC_BUILD}" )


set( CMAKE_CXX_FLAGS "${CMAKE_C_FLAGS} -std=c++14 -Wall" )
set( pthread_library pthread)


if(ENABLE_COVERAGE_TESTING)
    SET(CMAKE_CXX_FLAGS "--coverage ${CMAKE_CXX_FLAGS}")
endif()

# fc/src/compress/miniz.c breaks strict aliasing. The Linux kernel builds with no strict aliasing
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fno-strict-aliasing -DBOOST_THREAD_DONT_PROVIDE_PROMISE_LAZY" )
SET(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -fno-strict-aliasing -DBOOST_THREAD_DONT_PROVIDE_PROMISE_LAZY" )

# external_plugins needs to be compiled first because libraries/app depends on BLURT_EXTERNAL_PLUGINS being fully populated
add_subdirectory( libraries )
add_subdirectory( programs )
add_subdirectory( tests )

# Use clang-tidy as a linter
SET( BLURT_LINT_LEVEL "OFF" CACHE STRING "Lint level during steem build (FULL, HIGH, LOW, OFF)" )
find_program(
   CLANG_TIDY_EXE
   NAMES "clang-tidy"
   DOC "Path to clain-tidy executable"
)

if( NOT CLANG_TIDY_EXE )
   message( STATUS "clang-tidy not found" )
elseif( VERSION LESS 3.6 )
   messgae( STATUS "clang-tidy found but only supported with CMake version >= 3.6" )
else()
   message( STATUS "clany-tidy found: ${CLANG_TIDY_EXE}" )
   if( "${BLURT_LINT_LEVEL}" STREQUAL "FULL" )
      message( STATUS "Linting level set to: FULL" )
      set( DO_CLANG_TIDY "${CLANG_TIDY_EXE}" "-checks='*'" )
   elseif( "${BLURT_LINT_LEVEL}" STREQUAL "HIGH" )
      message( STATUS "Linting level set to: HIGH" )
      set( DO_CLANG_TIDY "${CLANG_TIDY_EXE}" "-checks='boost-use-to-string,clang-analyzer-*,cppcoreguidelines-*,llvm-*,misc-*,performance-*,readability-*'" )
   elseif( "${BLURT_LINT_LEVEL}" STREQUAL "LOW" )
      message( STATUS "Linting level set to: LOW" )
      set( DO_CLANG_TIDY "${CLANG_TIDY_EXE}" "-checks='clang-analyzer-*'" )
   else()
      unset( CLANG_TIDY_EXE )
      message( STATUS "Linting level set to: OFF" )
   endif()
endif( NOT CLANG_TIDY_EXE )




# Testnet Option
if( BUILD_BLURT_TESTNET )
  MESSAGE( STATUS "\n\n             CONFIGURED FOR TEST NETWORK             \n\n" )
else()
  MESSAGE( STATUS "\n\n             CONFIGURED FOR BLURT NETWORK             \n\n" )
endif()

if( ENABLE_MIRA )
  MESSAGE( STATUS "\n\n             CONFIGURED FOR MIRA                  \n\n" )
else()
  MESSAGE( STATUS "\n\n             CONFIGURED FOR BMIC MMAP             \n\n" )
endif()

if( LOW_MEMORY_NODE )
  MESSAGE( STATUS "\n\n             CONFIGURED FOR LOW MEMORY NODE          \n\n" )
else()
  MESSAGE( STATUS "\n\n             CONFIGURED FOR FULL NODE                \n\n" )
endif()

target_link_libraries( blurtd Boost::thread Boost::regex Boost::date_time Boost::system Boost::filesystem Boost::program_options Boost::iostreams Boost::serialization Boost::chrono Boost::context Boost::coroutine Boost::program_options )

target_link_libraries( blurtd RocksDB::rocksdb )
