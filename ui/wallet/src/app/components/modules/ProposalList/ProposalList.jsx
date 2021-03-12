import React from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import ProposalContainer from './ProposalContainer';

export default function ProposalList(props) {
    const { proposals, voteOnProposal, loading } = props;
    const proposalCount = proposals.length;

    if (!loading && proposalCount == 0) {
        return (
            <div className="ProposalsList">
                <center>
                    <h5>
                        {tt('proposals.sorry_cannot_display')}
                        <br />
                        <small>{tt('proposals.no_proposal_matching')}</small>
                    </h5>
                </center>
            </div>
        );
    } else if (loading && proposals.length == 0) {
        return (
            <div className="ProposalsList">
                <center>
                    <span>
                        <LoadingIndicator type="circle" />
                    </span>
                    <h5>
                        {tt('g.loading')}
                        <br />
                        <small>{tt('proposals.wait_for_proposal_load')}</small>
                    </h5>
                </center>
            </div>
        );
    }

    return (
        <div className="ProposalsList">
            <div className="proposals__header">
                <div className="proposals__votes">
                    {tt('proposals.vote_hp')}
                </div>
                <div className="proposals__avatar"> </div>
                <div className="proposals__description">
                    {tt('proposals.proposal')}
                </div>
                <div className="proposals__amount">
                    {tt('proposals.amount')}
                </div>
            </div>
            {proposals.map((proposal) => (
                <ProposalContainer
                    key={proposal.id}
                    voteOnProposal={voteOnProposal}
                    proposal={proposal}
                />
            ))}
        </div>
    );
}

ProposalList.propTypes = {
    proposals: PropTypes.array.isRequired, // TODO: Specify Shape
    voteOnProposal: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};
