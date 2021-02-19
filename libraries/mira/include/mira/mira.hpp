#pragma once

#include <mira/boost_adapter.hpp>
#include <mira/multi_index_container.hpp>

namespace mira {

template <typename Value, typename IndexSpecifierList, typename Allocator>
struct multi_index_adapter {
  typedef boost::multi_index_container<Value, IndexSpecifierList, Allocator>
      boost_container;
  typedef multi_index_container<Value, IndexSpecifierList, Allocator>
      mira_container;
};

} // namespace mira