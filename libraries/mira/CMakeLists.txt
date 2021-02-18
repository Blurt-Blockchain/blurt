# Defines MIRA library target.
project( MIRA )
cmake_minimum_required( VERSION 2.8.12 )

file(GLOB HEADERS "include/mira/*.hpp" "include/mira/detail/*.hpp")

set(CMAKE_EXPORT_COMPILE_COMMANDS "ON")
SET(BOOST_COMPONENTS)
LIST(APPEND BOOST_COMPONENTS thread
                             date_time
                             system
                             filesystem
                             chrono
                             unit_test_framework
                             locale)

FIND_PACKAGE(Boost 1.58 REQUIRED COMPONENTS ${BOOST_COMPONENTS})
set( Boost_USE_STATIC_LIBS ON CACHE STRING "ON or OFF" )


  # Linux Specific Options Here
message( STATUS "Configuring MIRA" )
set( CMAKE_CXX_FLAGS "${CMAKE_C_FLAGS} -std=c++14 -Wall" )
set( pthread_library pthread)


if( "${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU" )
  set( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fno-builtin-memcmp" )
endif()

if(ENABLE_COVERAGE_TESTING)
    SET(CMAKE_CXX_FLAGS "--coverage ${CMAKE_CXX_FLAGS}")
endif()

add_library( mira
             src/mira.cpp
             src/configuration.cpp
             ${HEADERS}
           )

if( CLANG_TIDY_EXE )
   set_target_properties(
      mira PROPERTIES
      CXX_CLANG_TIDY "${DO_CLANG_TIDY}"
   )
endif( CLANG_TIDY_EXE )

target_link_libraries( mira ${Boost_LIBRARIES} rocksdb fc )

target_include_directories( mira
   PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/include"
          "${CONAN_INCLUDE_DIRS_ROCKSDB}/rocksdb/include"
          ${Boost_INCLUDE_DIR}
   )

add_subdirectory( test )

INSTALL( TARGETS
   mira

   RUNTIME DESTINATION bin
   LIBRARY DESTINATION lib
   ARCHIVE DESTINATION lib
)
INSTALL( FILES ${HEADERS} DESTINATION "include/mira" )

