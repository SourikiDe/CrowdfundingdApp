#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol, Address, Map, Vec};

#[derive(Clone)]
#[contract]
pub struct CrowdfundingContract;

#[contractimpl]
impl CrowdfundingContract {

    // Initialize campaign
    pub fn create_campaign(
        env: Env,
        creator: Address,
        goal: i128,
    ) {
        let mut campaigns: Map<Address, i128> =
            env.storage().instance().get(&Symbol::short("CMP")).unwrap_or(Map::new(&env));

        campaigns.set(creator.clone(), goal);
        env.storage().instance().set(&Symbol::short("CMP"), &campaigns);
    }

    // Contribute funds
    pub fn contribute(
        env: Env,
        contributor: Address,
        creator: Address,
        amount: i128,
    ) {
        let mut contributions: Map<Address, i128> =
            env.storage().instance().get(&Symbol::short("CTR")).unwrap_or(Map::new(&env));

        let current = contributions.get(contributor.clone()).unwrap_or(0);
        contributions.set(contributor, current + amount);

        env.storage().instance().set(&Symbol::short("CTR"), &contributions);
    }

    // Get campaign goal
    pub fn get_campaign(env: Env, creator: Address) -> i128 {
        let campaigns: Map<Address, i128> =
            env.storage().instance().get(&Symbol::short("CMP")).unwrap();

        campaigns.get(creator).unwrap_or(0)
    }

    // Get contribution
    pub fn get_contribution(env: Env, contributor: Address) -> i128 {
        let contributions: Map<Address, i128> =
            env.storage().instance().get(&Symbol::short("CTR")).unwrap();

        contributions.get(contributor).unwrap_or(0)
    }
}