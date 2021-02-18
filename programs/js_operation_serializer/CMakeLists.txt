add_executable( js_operation_serializer main.cpp )


target_link_libraries( js_operation_serializer
                       PRIVATE blurt_chain blurt_protocol fc ${CMAKE_DL_LIBS} ${PLATFORM_SPECIFIC_LIBS} )

install( TARGETS
   js_operation_serializer

   RUNTIME DESTINATION bin
   LIBRARY DESTINATION lib
   ARCHIVE DESTINATION lib
)
