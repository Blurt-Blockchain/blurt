#include <blurt/protocol/operations.hpp>

#include <blurt/protocol/operation_util_impl.hpp>

namespace blurt { namespace protocol {

struct is_market_op_visitor {
   typedef bool result_type;

   template<typename T>
   bool operator()( T&& v )const { return false; }
   bool operator()( const transfer_operation& )const { return true; }
   bool operator()( const transfer_to_vesting_operation& )const { return true; }
};

bool is_market_operation( const operation& op ) {
   return op.visit( is_market_op_visitor() );
}

struct is_vop_visitor
{
   typedef bool result_type;

   template< typename T >
   bool operator()( const T& v )const { return v.is_virtual(); }
};

bool is_virtual_operation( const operation& op )
{
   return op.visit( is_vop_visitor() );
}

struct hardfork_visitor
{
   typedef void result_type;
   hardfork_visitor( uint32_t num ) : hardfork( num ) {}

   template< typename T >
   void operator()( T& v )const { v.set_hardfork(hardfork); }

private:
   uint32_t hardfork;
};

void set_op_hardfork( operation& op, uint32_t hardfork )
{
   op.visit( hardfork_visitor( hardfork ) );
}

} } // blurt::protocol

BLURT_DEFINE_OPERATION_TYPE( blurt::protocol::operation )
