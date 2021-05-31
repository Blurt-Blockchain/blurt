file(GLOB HEADERS "include/blurt/plugins/account_history_rocksdb/*.hpp")

add_library( account_history_rocksdb_plugin
             account_history_rocksdb_plugin.cpp
             ${HEADERS}
           )

target_link_libraries( account_history_rocksdb_plugin chain_plugin blurt_chain blurt_protocol json_rpc_plugin RocksDB::rocksdb )

target_include_directories( account_history_rocksdb_plugin
   PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/include"
   )


install( TARGETS
   account_history_rocksdb_plugin

   RUNTIME DESTINATION bin
   LIBRARY DESTINATION lib
   ARCHIVE DESTINATION lib
)
