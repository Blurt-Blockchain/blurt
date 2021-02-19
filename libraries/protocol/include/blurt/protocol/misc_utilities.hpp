#pragma once

namespace blurt {
namespace protocol {

enum curve_id {
  quadratic,
  bounded_curation,
  linear,
  square_root,
  convergent_linear,
  convergent_square_root
};

}
} // namespace blurt

FC_REFLECT_ENUM(blurt::protocol::curve_id,
                (quadratic)(bounded_curation)(linear)(square_root)(
                    convergent_linear)(convergent_square_root))
