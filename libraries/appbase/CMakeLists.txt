# Defines AppBase library target.
project( AppBase )
cmake_minimum_required( VERSION 3.16.3 )

file(GLOB HEADERS "include/appbase/*.hpp")

set(CMAKE_EXPORT_COMPILE_COMMANDS "ON")
SET(BOOST_COMPONENTS)
LIST(APPEND BOOST_COMPONENTS thread
                             date_time
                             system
                             filesystem
                             chrono
                             program_options
                             unit_test_framework
                             locale)

FIND_PACKAGE(Boost 1.58 REQUIRED COMPONENTS ${BOOST_COMPONENTS})
set( Boost_USE_STATIC_LIBS ON CACHE STRING "ON or OFF" )


# Linux Specific Options Here
message( STATUS "Configuring AppBase" )
set( CMAKE_CXX_FLAGS "${CMAKE_C_FLAGS} -std=c++14 -Wall" )



if(ENABLE_COVERAGE_TESTING)
    SET(CMAKE_CXX_FLAGS "--coverage ${CMAKE_CXX_FLAGS}")
endif()

add_library( appbase
             application.cpp
             ${HEADERS}
           )

target_link_libraries( appbase ${Boost_LIBRARIES})

target_include_directories( appbase
                            PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/include" ${Boost_INCLUDE_DIR})

INSTALL( TARGETS
   appbase

   RUNTIME DESTINATION bin
   LIBRARY DESTINATION lib
   ARCHIVE DESTINATION lib
)
INSTALL( FILES ${HEADERS} DESTINATION "include/appbase" )

add_subdirectory( examples )
