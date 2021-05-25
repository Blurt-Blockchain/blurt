# Defines ChainBase library target.
project( ChainBase )
cmake_minimum_required( VERSION 3.16.3 )

#list( APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/CMakeModules" )

set(CMAKE_EXPORT_COMPILE_COMMANDS "ON")

SET(BOOST_COMPONENTS)
LIST(APPEND BOOST_COMPONENTS thread
                             date_time
                             system
                             filesystem
                             chrono
                             unit_test_framework
                             locale)

SET( Boost_USE_STATIC_LIBS ON CACHE STRING "ON or OFF" )





# Linux Specific Options Here
message( STATUS "Configuring ChainBase on Linux" )
set( CMAKE_CXX_FLAGS "${CMAKE_C_FLAGS} -std=c++11 -Wall" )
set( pthread_library pthread)


if( "${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU" )
  set( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fno-builtin-memcmp" )
endif()


# based on http://www.delorie.com/gnu/docs/gdb/gdb_70.html
# uncomment this line to tell GDB about macros (slows compile times)
# set( CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -gdwarf-2 -g3" )

set(ENABLE_COVERAGE_TESTING FALSE CACHE BOOL "Build ChainBase for code coverage analysis")

if(ENABLE_COVERAGE_TESTING)
    SET(CMAKE_CXX_FLAGS "--coverage ${CMAKE_CXX_FLAGS}")
endif()


file(GLOB HEADERS "include/chainbase/*.hpp" "include/chainbase/util/*.hpp")
add_library( chainbase src/chainbase.cpp ${HEADERS} )
target_link_libraries( chainbase  ${Boost_LIBRARIES} )
target_include_directories( chainbase PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/include"  ${Boost_INCLUDE_DIRS} )

if( CLANG_TIDY_EXE )
   set_target_properties(
      chainbase PROPERTIES
      CXX_CLANG_TIDY "${DO_CLANG_TIDY}"
   )
endif( CLANG_TIDY_EXE )

add_subdirectory( test )

install( TARGETS
   chainbase

   RUNTIME DESTINATION bin
   LIBRARY DESTINATION lib
   ARCHIVE DESTINATION lib
)
install( FILES ${HEADERS} DESTINATION "include/" )
