#pragma once
#include <blurt/chain/blurt_fwd.hpp>


namespace blurt { namespace chain { 
    class moderator_object : public object< moderator_object_type, moderator_object >
    {
        BLURT_STD_ALLOCATOR_CONSTRUCTOR( moderator_object )

        public:
            template<typename Constructor, typename Allocator>
            moderator_object( Constructor&& c, allocator< Allocator > a)
                :url( a )
            {
                c(*this);
            };
    
            id_type            id;
    
            account_name_type  name;
            time_point_sec     created;
            shared_string      url;
            share_type         votes;
    };

    class moderator_weight_vote_object : public object< moderator_weight_vote_object_type, moderator_weight_vote_object >
    {
        public:
            template< typename Constructor, typename Allocator >
            moderator_weight_vote_object( Constructor&& c, allocator< Allocator > a )
            {
                c( *this );
            }

            moderator_weight_vote_object(){}

            id_type           id;

            account_name_type moderator;
            account_name_type account;
            asset             shares;
    };

    class moderator_complaint_object : public object< moderator_complaint_object_type, moderator_complaint_object >
    {
        public:
            template< typename Constructor, typename Allocator >
            moderator_complaint_object( Constructor&& c, allocator< Allocator > a )
            {
                c( *this );
            }

            moderator_complaint_object(){}

            id_type           id;

            account_name_type moderator;
            account_name_type account;
    };


    struct by_vote_name;

    typedef multi_index_container<
        moderator_object,
        indexed_by<
            ordered_unique< tag< by_id >, member< moderator_object, moderator_id_type, &moderator_object::id > >,
            ordered_unique< tag< by_name >, member< moderator_object, account_name_type, &moderator_object::name > >,
            ordered_unique< tag< by_vote_name >,
                composite_key< moderator_object,
                    member< moderator_object, share_type, &moderator_object::votes >,
                    member< moderator_object, account_name_type, &moderator_object::name >
                >,
                composite_key_compare< std::greater< share_type >, std::less< account_name_type > >
            >,
        >,
        allocator< moderator_object >
    > moderator_index;

    struct by_account_moderator;
    struct by moderator_account;
    typedef multi_index_container<
        moderator_weight_vote_object,
        indexed_by<
            ordered_unique< tag< by_id >, member< moderator_weight_vote_object, moderator_weight_vote_id_type, &moderator_weight_vote_object::id > >,
            ordered_unique< tag< by_account_moderator >,
                composite_key< moderator_weight_vote_object,
                    member< moderator_weight_vote_object, account_name_type, &moderator_weight_vote_object::account >,
                    member< moderator_weight_vote_object, account_name_type, &moderator_weight_vote_object::moderator >
                >,
                composite_key_compare< std::less< account_name_type >, std::less< account_name_type > >
            >,
            ordered_unique< tag< by_moderator_account >,
                composite_key< moderator_weight_vote_object,
                    member< moderator_weight_vote_object, account_name_type, &moderator_weight_vote_object::moderator >,
                    member< moderator_weight_vote_object, account_name_type, &moderator_weight_vote_object::account >
                >,
                composite_key_compare< std::less< account_name_type >, std::less< account_name_type > >
            >
        >,
        allocator< moderator_weight_vote_object >
    > moderator_weight_vote_index;

    typedef multi_index_container<
        moderator_complaint_object,
        indexed_by<
            ordered_unique< tag< by_id >, member< moderator_complaint_object, moderator_complaint_id_type, &moderator_complaint_object::id > >,
            ordered_unique< tag< by_account_moderator >,
                composite_key< moderator_complaint_object,
                    member< moderator_complaint_object, account_name_type, &moderator_complaint_object::account >,
                    member< moderator_complaint_object, account_name_type, &moderator_complaint_object::moderator >
                >,
                composite_key_compare< std::less< account_name_type >, std::less< account_name_type > >
            >,
            ordered_unique< tag< by_moderator_account >,
                composite_key< moderator_complaint_object,
                    member< moderator_complaint_object, account_name_type, &moderator_complaint_object::moderator >,
                    member< moderator_complaint_object, account_name_type, &moderator_complaint_object::account >
                >,
                composite_key_compare< std::less< account_name_type >, std::less< account_name_type > >
            >
        >,
        allocator< moderator_complaint_object >
    > moderator_complaint_index;
} }

#ifdef ENABLE_MIRA
namespace mira {

    template<> struct is_static_length< blurt::chain::moderator_weight_vote_object > : public boost::true_type {};
    template<> struct is_static_length< blurt::chain::moderator_complaint_object > : public boost::true_type {};

}
#endif

FC_REFLECT( blurt::chain::moderator_object,
             (id)
             (name)
             (created)
             (url)
             (votes)
          )
CHAINBASE_SET_INDEX_TYPE( blurt::chain::moderator_object, blurt::chain::moderator_index )

FC_REFLECT( blurt::chain::moderator_weight_vote_object,
             (id)
             (moderator)
             (account)
             (shares)
          )
CHAINBASE_SET_INDEX_TYPE( blurt::chain::moderator_weight_vote_object, blurt::chain::moderator_weight_vote_index )

FC_REFLECT( blurt::chain::moderator_complaint_object,
             (id)
             (moderator)
             (account)
          )
CHAINBASE_SET_INDEX_TYPE( blurt::chain::moderator_complaint_object, blurt::chain::moderator_complaint_index )