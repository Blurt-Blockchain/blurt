#ifndef NDEBUG
#include "thread_d.hpp"
#include <fc/thread/non_preemptable_scope_check.hpp>
#include <fc/thread/thread.hpp>

namespace fc {
non_preemptable_scope_check::non_preemptable_scope_check() {
  ++thread::current().my->non_preemptable_scope_count;
}

non_preemptable_scope_check::~non_preemptable_scope_check() {
  assert(thread::current().my->non_preemptable_scope_count > 0);
  --thread::current().my->non_preemptable_scope_count;
}
} // namespace fc
#endif