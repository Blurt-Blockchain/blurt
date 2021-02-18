add_executable( cli_wallet main.cpp )


find_package( Gperftools QUIET )
if( GPERFTOOLS_FOUND )
    message( STATUS "Found gperftools; compiling cli_wallet with TCMalloc")
    list( APPEND PLATFORM_SPECIFIC_LIBS tcmalloc )
endif()

if( BLURT_STATIC_BUILD )
   target_link_libraries( cli_wallet PRIVATE
                          graphene_net blurt_chain blurt_protocol blurt_utilities blurt_wallet condenser_api_plugin fc ${CMAKE_DL_LIBS} ${PLATFORM_SPECIFIC_LIBS} )
else( BLURT_STATIC_BUILD )
   target_link_libraries( cli_wallet PRIVATE
                          graphene_net blurt_chain blurt_protocol blurt_utilities blurt_wallet condenser_api_plugin fc ${CMAKE_DL_LIBS} ${PLATFORM_SPECIFIC_LIBS} )
endif( BLURT_STATIC_BUILD )

if( CLANG_TIDY_EXE )
   set_target_properties(
      cli_wallet PROPERTIES
      CXX_CLANG_TIDY "${DO_CLANG_TIDY}"
   )
endif( CLANG_TIDY_EXE )


install( TARGETS
   cli_wallet

   RUNTIME DESTINATION bin
   LIBRARY DESTINATION lib
   ARCHIVE DESTINATION lib
)
