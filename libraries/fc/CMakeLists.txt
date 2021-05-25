#
# Defines fc library target.

PROJECT( fc )
CMAKE_MINIMUM_REQUIRED( VERSION 3.16.3 )

MESSAGE(STATUS "Configuring project fc located in: ${CMAKE_CURRENT_SOURCE_DIR}")
SET( CMAKE_AUTOMOC OFF )

# Setup module path to make visible used CMake extensions
list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/GitVersionGen")
list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/CMakeModules")

INCLUDE(GetPrerequisites)
INCLUDE( VersionMacros )
INCLUDE( SetupTargetMacros )
INCLUDE(GetGitRevisionDescription)

get_git_head_revision(GIT_REFSPEC FC_GIT_REVISION_SHA)
get_git_unix_timestamp(FC_GIT_REVISION_UNIX_TIMESTAMP)

SET( DEFAULT_HEADER_INSTALL_DIR include/\${target} )
SET( DEFAULT_LIBRARY_INSTALL_DIR lib/ )
SET( DEFAULT_EXECUTABLE_INSTALL_DIR bin/ )
SET( CMAKE_DEBUG_POSTFIX _debug )
SET( BUILD_SHARED_LIBS NO )
SET( ECC_IMPL secp256k1 CACHE STRING "secp256k1 or openssl or mixed" )


SET (ORIGINAL_LIB_SUFFIXES ${CMAKE_FIND_LIBRARY_SUFFIXES})

SET(BOOST_COMPONENTS)
LIST(APPEND BOOST_COMPONENTS thread date_time system filesystem program_options serialization chrono unit_test_framework context locale iostreams)
SET( Boost_USE_STATIC_LIBS ON CACHE STRING "ON or OFF" )

IF( ECC_IMPL STREQUAL openssl )
  SET( ECC_REST src/crypto/elliptic_impl_pub.cpp )
ELSE( ECC_IMPL STREQUAL openssl )
  SET( ECC_LIB secp256k1 )
  IF( ECC_IMPL STREQUAL mixed )
    SET( ECC_REST src/crypto/elliptic_impl_priv.cpp src/crypto/elliptic_impl_pub.cpp )
  ELSE( ECC_IMPL STREQUAL mixed )
    SET( ECC_REST src/crypto/elliptic_impl_priv.cpp )
  ENDIF( ECC_IMPL STREQUAL mixed )
ENDIF( ECC_IMPL STREQUAL openssl )



# Configure secp256k1-zkp
include(ExternalProject)


ExternalProject_Add( project_secp256k1
 PREFIX ${CMAKE_CURRENT_BINARY_DIR}/vendor/secp256k1-zkp
 SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/vendor/secp256k1-zkp
 CONFIGURE_COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/vendor/secp256k1-zkp/configure --prefix=${CMAKE_CURRENT_BINARY_DIR}/vendor/secp256k1-zkp --with-bignum=no
 BUILD_COMMAND make
 INSTALL_COMMAND true
 BUILD_BYPRODUCTS ${CMAKE_CURRENT_BINARY_DIR}/vendor/secp256k1-zkp/src/project_secp256k1-build/.libs/libsecp256k1.a
)

ExternalProject_Add_Step(project_secp256k1 autogen
 WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/vendor/secp256k1-zkp
 COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/vendor/secp256k1-zkp/autogen.sh
 DEPENDERS configure
    )

ExternalProject_Get_Property(project_secp256k1 binary_dir)

add_library(secp256k1 STATIC IMPORTED)
set_property(TARGET secp256k1 PROPERTY IMPORTED_LOCATION ${binary_dir}/.libs/libsecp256k1${CMAKE_STATIC_LIBRARY_SUFFIX})
set_property(TARGET secp256k1 PROPERTY INTERFACE_INCLUDE_DIRECTORIES ${CMAKE_CURRENT_SOURCE_DIR}/vendor/secp256k1-zkp/include)
add_dependencies(secp256k1 project_secp256k1)


# End configure secp256k1-zkp

MESSAGE(STATUS "Configuring fc to build on Unix/Apple")

LIST(APPEND BOOST_COMPONENTS coroutine)

FIND_PACKAGE(Boost 1.53 REQUIRED COMPONENTS ${BOOST_COMPONENTS})

SET(CMAKE_FIND_LIBRARY_SUFFIXES ".a;.so")

SET(pthread_library pthread)



IF(NOT "$ENV{OPENSSL_ROOT_DIR}" STREQUAL "")
  set(OPENSSL_ROOT_DIR $ENV{OPENSSL_ROOT_DIR} )
  set(OPENSSL_INCLUDE_DIR ${OPENSSL_ROOT_DIR}/include)
  message(STATUS "Setting up OpenSSL root and include vars to ${OPENSSL_ROOT_DIR}, ${OPENSSL_INCLUDE_DIR}")
ENDIF()


find_package(OpenSSL REQUIRED)

set( CMAKE_FIND_LIBRARY_SUFFIXES ${ORIGINAL_LIB_SUFFIXES} )

option( UNITY_BUILD OFF )

set( fc_sources
     src/uint128.cpp
     src/real128.cpp
     src/variant.cpp
     src/exception.cpp
     src/variant_object.cpp
     src/thread/thread.cpp
     src/thread/thread_specific.cpp
     src/thread/future.cpp
     src/thread/task.cpp
     src/thread/spin_lock.cpp
     src/thread/spin_yield_lock.cpp
     src/thread/mutex.cpp
     src/thread/non_preemptable_scope_check.cpp
     src/asio.cpp
     src/string.cpp
     src/shared_ptr.cpp
     src/time.cpp
     src/utf8.cpp
     src/io/iostream.cpp
     src/io/datastream.cpp
     src/io/buffered_iostream.cpp
     src/io/fstream.cpp
     src/io/sstream.cpp
     src/io/json.cpp
     src/io/varint.cpp
     src/io/console.cpp
     src/filesystem.cpp
     src/interprocess/signals.cpp
     src/interprocess/file_mapping.cpp
     src/interprocess/mmap_struct.cpp
     src/interprocess/file_mutex.cpp
     src/rpc/cli.cpp
     src/rpc/http_api.cpp
     src/rpc/json_connection.cpp
     src/rpc/state.cpp
     src/rpc/bstate.cpp
     src/rpc/websocket_api.cpp
     src/log/log_message.cpp
     src/log/logger.cpp
     src/log/appender.cpp
     src/log/console_appender.cpp
     src/log/file_appender.cpp
     src/log/gelf_appender.cpp
     src/log/logger_config.cpp
     src/crypto/_digest_common.cpp
     src/crypto/openssl.cpp
     src/crypto/aes.cpp
     src/crypto/crc.cpp
     src/crypto/city.cpp
     src/crypto/base32.cpp
     src/crypto/base36.cpp
     src/crypto/base58.cpp
     src/crypto/base64.cpp
     src/crypto/bigint.cpp
     src/crypto/hex.cpp
     src/crypto/sha1.cpp
     src/crypto/ripemd160.cpp
     src/crypto/sha256.cpp
     src/crypto/sha224.cpp
     src/crypto/sha512.cpp
     src/crypto/blowfish.cpp
     src/crypto/elliptic_common.cpp
     src/crypto/restartable_sha256.cpp
     ${ECC_REST}
     src/crypto/elliptic_${ECC_IMPL}.cpp
     src/crypto/rand.cpp
     src/network/tcp_socket.cpp
     src/network/udp_socket.cpp
     src/network/http/http_connection.cpp
     src/network/http/http_server.cpp
     src/network/http/websocket.cpp
     src/network/ntp.cpp
     src/network/ip.cpp
     src/network/rate_limiting.cpp
     src/network/resolve.cpp
     src/network/url.cpp
     src/network/gntp.cpp
     src/compress/smaz.cpp
     src/compress/zlib.cpp
     src/reflect/typename.cpp
     vendor/cyoencode-1.0.2/src/CyoDecode.c
     vendor/cyoencode-1.0.2/src/CyoEncode.c
     )

file( GLOB_RECURSE fc_headers ${CMAKE_CURRENT_SOURCE_DIR} *.hpp *.h )

set( sources
  ${fc_sources}
)

configure_file("${CMAKE_CURRENT_SOURCE_DIR}/src/git_revision.cpp.in" "${CMAKE_CURRENT_BINARY_DIR}/git_revision.cpp" @ONLY)
list(APPEND sources "${CMAKE_CURRENT_BINARY_DIR}/git_revision.cpp")
list(APPEND sources ${fc_headers})


setup_library( fc SOURCES ${sources} LIBRARY_TYPE STATIC DONT_INSTALL_LIBRARY )

# begin readline stuff
find_package(Curses)
find_package(Readline)

file(GLOB HEADERS "include/bts/cli/*.hpp")

if (READLINE_FOUND)
  target_compile_definitions (fc PRIVATE HAVE_READLINE)
  set(readline_libraries ${Readline_LIBRARY})
  if (CURSES_FOUND)
    list(APPEND readline_libraries ${CURSES_LIBRARY})
  endif()
  set(readline_includes ${Readline_INCLUDE_DIR})
endif()
# end readline stuff


SET(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -std=c99 -Wall")

find_package( ZLIB )

if( ZLIB_FOUND )
  MESSAGE( STATUS "zlib found" )
  add_definitions( -DHAS_ZLIB )
else()
  MESSAGE( STATUS "zlib not found" )
  set( ZLIB_LIBRARIES "" )
endif( ZLIB_FOUND )

find_package( BZip2 )
if( BZIP2_FOUND )
   MESSAGE( STATUS "bzip2 found" )
   add_definitions( -DHAS_BZIP2 )
else()
   MESSAGE( STATUS "bzip2 not found" )
   set( BZIP2_LIBRARIES "" )
endif( BZIP2_FOUND )

# This will become unnecessary once we update to websocketpp which fixes upstream issue #395
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DWEBSOCKETPP_STRICT_MASKING")

SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DBOOST_ASIO_HAS_STD_CHRONO")

OPTION( LOG_LONG_API "Log long API calls over websocket (ON OR OFF)" ON )
MESSAGE( STATUS "LOG_LONG_API: ${LOG_LONG_API}" )
if( LOG_LONG_API )
  SET( LOG_LONG_API_MAX_MS 1000 CACHE STRING "Max API execution time in ms" )
  SET( LOG_LONG_API_WARN_MS 750 CACHE STRING "API execution time in ms at which to warn" )
  MESSAGE( STATUS "     " )
  MESSAGE( STATUS "     LOGGING LONG API CALLS" )
  MESSAGE( STATUS "          MAX  MS: ${LOG_LONG_API_MAX_MS}" )
  MESSAGE( STATUS "          WARN MS: ${LOG_LONG_API_WARN_MS}" )
  MESSAGE( STATUS "     " )
  SET( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DLOG_LONG_API -DLOG_LONG_API_MAX_MS=${LOG_LONG_API_MAX_MS} -DLOG_LONG_API_WARN_MS=${LOG_LONG_API_WARN_MS}" )
  SET( CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DLOG_LONG_API -DLOG_LONG_API_MAX_MS=${LOG_LONG_API_MAX_MS} -DLOG_LONG_API_WARN_MS=${LOG_LONG_API_WARN_MS}" )
endif()

target_include_directories(fc
  PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${Boost_INCLUDE_DIRS}
    ${OPENSSL_INCLUDE_DIR}
    "vendor/diff-match-patch-cpp-stl"
    ${CONAN_INCLUDE_DIRS_WEBSOCKETPP}
    "${readline_includes}"

  PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/vendor/cyoencode-1.0.2/src
    ${CMAKE_CURRENT_SOURCE_DIR}/vendor/secp256k1-zkp
    ${CMAKE_CURRENT_SOURCE_DIR}/vendor/bitcoin/src
  )

#target_link_libraries( fc PUBLIC ${Boost_LIBRARIES} ${OPENSSL_LIBRARIES} ${ZLIB_LIBRARIES} ${BZIP2_LIBRARIES} ${PLATFORM_SPECIFIC_LIBS} ${RPCRT4} ${CMAKE_DL_LIBS} ${rt_library} ${ECC_LIB} )
set(LINK_USR_LOCAL_LIB -L/usr/local/lib)
set(LINK_USR_LOCAL_INCLUDE -L/usr/local/include)
target_link_libraries( fc PUBLIC ${LINK_USR_LOCAL_LIB} ${LINK_USR_LOCAL_INCLUDE} ${OPENSSL_LIBRARIES} ${ZLIB_LIBRARIES} ${BZIP2_LIBRARIES} ${Boost_LIBRARIES} ${PLATFORM_SPECIFIC_LIBS} ${RPCRT4} ${CMAKE_DL_LIBS} ${rt_library} ${readline_libraries} ${ECC_LIB})



add_definitions(-DBOOST_TEST_DYN_LINK)


add_subdirectory(tests)


SET(OPENSSL_CONF_TARGET )
IF(DEFINED CMAKE_RUNTIME_OUTPUT_DIRECTORY)
  SET (OPENSSL_CONF_TARGET ${CMAKE_RUNTIME_OUTPUT_DIRECTORY})
ELSE()
  SET (OPENSSL_CONF_TARGET ${CMAKE_CURRENT_BINARY_DIR})
ENDIF()

ADD_CUSTOM_COMMAND(TARGET fc POST_BUILD ${POST_BUILD_STEP_COMMANDS}
  COMMENT "Copying OpenSSL/ssl/openssl.cnf into target directory."
)

MESSAGE(STATUS "Finished fc module configuration...")
