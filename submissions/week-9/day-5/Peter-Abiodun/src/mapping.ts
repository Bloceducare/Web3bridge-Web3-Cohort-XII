import { BigInt } from "@graphprotocol/graph-ts"
import { 
  Staked, 
  Withdrawn, 
  RewardsClaimed, 
  RewardRateUpdated, 
  EmergencyWithdrawn 
} from "../generated/StakingContract/StakingContract"

import { User, Stake, Reward, ProtocolMetrics } from "../generated/schema"

export function handleStaked(event: Staked): void {
  let user = User.load(event.params.user.toHex())
  if (!user) {
    user = new User(event.params.user.toHex())
  }

  let stake = new Stake(event.transaction.hash.toHex()) 
  stake.user = user.id
  stake.amount = event.params.amount
  stake.timestamp = event.block.timestamp
  stake.isWithdrawn = false
  stake.save()

  user.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let stake = Stake.load(event.transaction.hash.toHex())
  if (stake) {
    stake.isWithdrawn = true
    stake.save()
  }
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  let reward = new Reward(event.transaction.hash.toHex())
  reward.user = event.params.user.toHex()
  reward.amount = event.params.amount
  reward.timestamp = event.block.timestamp
  reward.save()
}

export function handleRewardRateUpdated(event: RewardRateUpdated): void {
  let metrics = ProtocolMetrics.load("1")
  if (!metrics) {
    metrics = new ProtocolMetrics("1")
    metrics.totalStaked = BigInt.fromI32(0)
    metrics.currentRewardRate = BigInt.fromI32(0)
  }
  
  metrics.save()
}

export function handleEmergencyWithdrawn(event: EmergencyWithdrawn): void {
  let stake = Stake.load(event.transaction.hash.toHex())
  if (stake) {
    stake.isWithdrawn = true
    stake.save()
  }
}
