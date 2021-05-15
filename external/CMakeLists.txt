ExternalProject_Add(rocksdb-ext
    SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/rocksdb
    BINARY_DIR rocksdb-ext
    TEST_EXCLUDE_FROM_MAIN 1
    EXCLUDE_FROM_ALL 1
    CMAKE_ARGS
        -DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}
        -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}/rocksdb
        -DWITH_GFLAGS=OFF
        -DWITH_TESTS=OFF
        -DWITH_TOOLS=OFF
        -DWITH_BENCHMARK_TOOLS=OFF
        -DFAIL_ON_WARNINGS=OFF
        -DCMAKE_INSTALL_PREFIX_INITIALIZED_TO_DEFAULT=OFF
        -DCMAKE_INSTALL_LIBDIR=lib
        -DCMAKE_C_COMPILER_LAUNCHER=${CMAKE_C_COMPILER_LAUNCHER}
        -DCMAKE_CXX_COMPILER_LAUNCHER=${CMAKE_CXX_COMPILER_LAUNCHER}
        BUILD_BYPRODUCTS ${CMAKE_BINARY_DIR}/rocksdb/lib/librocksdb.a
    )
add_library(rocksdb INTERFACE)
target_include_directories(rocksdb INTERFACE ${CMAKE_BINARY_DIR}/rocksdb/include)
target_link_libraries(rocksdb INTERFACE ${CMAKE_BINARY_DIR}/rocksdb/lib/librocksdb.a)
add_dependencies(rocksdb rocksdb-ext)