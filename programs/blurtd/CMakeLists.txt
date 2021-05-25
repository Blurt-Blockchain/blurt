add_executable( blurtd main.cpp )

if( GPERFTOOLS_FOUND )
    message( STATUS "Found gperftools; compiling blurtd with TCMalloc")
    list( APPEND PLATFORM_SPECIFIC_LIBS tcmalloc )
endif()

target_link_libraries( blurtd PRIVATE
      appbase
      blurt_utilities
      blurt_plugins
   )


if( CLANG_TIDY_EXE )
   set_target_properties(
      blurtd PROPERTIES
      CXX_CLANG_TIDY "${DO_CLANG_TIDY}"
   )
endif( CLANG_TIDY_EXE )