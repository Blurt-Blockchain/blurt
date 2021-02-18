add_executable( blurtd main.cpp )

find_package( Gperftools QUIET )
if( GPERFTOOLS_FOUND )
    message( STATUS "Found gperftools; compiling blurtd with TCMalloc")
    list( APPEND PLATFORM_SPECIFIC_LIBS tcmalloc )
endif()

if( BLURT_STATIC_BUILD )
   target_link_libraries( blurtd PRIVATE
      "-static-libstdc++ -static-libgcc"
      appbase
      blurt_utilities
      blurt_plugins
      ${CMAKE_DL_LIBS}
      ${PLATFORM_SPECIFIC_LIBS}
   )
else( BLURT_STATIC_BUILD )
   target_link_libraries( blurtd PRIVATE
      appbase
      blurt_utilities
      blurt_plugins
      ${CMAKE_DL_LIBS}
      ${PLATFORM_SPECIFIC_LIBS}
   )
endif( BLURT_STATIC_BUILD )

if( CLANG_TIDY_EXE )
   set_target_properties(
      blurtd PROPERTIES
      CXX_CLANG_TIDY "${DO_CLANG_TIDY}"
   )
endif( CLANG_TIDY_EXE )

install( TARGETS
   blurtd

   RUNTIME DESTINATION bin
   LIBRARY DESTINATION lib
   ARCHIVE DESTINATION lib
)
