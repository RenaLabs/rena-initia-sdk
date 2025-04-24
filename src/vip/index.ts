import { MsgExecute, MsgInitiateTokenDeposit, MsgSend, Coin, MsgInitiateTokenWithdrawal } from '@initia/initia.js'
import { toBigInt } from "ethers";
import { contractConfigs } from '../config';

type NetworkType = 'testnet' | 'mainnet';

export function updateVIPStage(
    sender: string,
    args: any[],
    network: NetworkType = 'mainnet'
) {
    const msg = new MsgExecute(
        sender,
        contractConfigs[network as keyof typeof contractConfigs].VIPContract,
        'vip_score',
        'set_init_stage',
        [],
        args
    )

    return msg;
}
