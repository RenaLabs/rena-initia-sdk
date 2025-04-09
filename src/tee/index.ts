import { MsgExecute, MsgSend } from '@initia/initia.js'
import { toBigInt } from "ethers";

/**
 * Creates a message to upload a signature to a smart contract
 * 
 * @param sender - The address of the sender
 * @param contractAddress - The address of the smart contract
 * @param module - The module name in the smart contract
 * @param functionName - The function name to call
 * @param typeArgs - Type arguments for the function
 * @param args - Arguments for the function
 * @returns A MsgExecute instance for uploading a signature
 */
export function uploadSignature(
    sender: string,
    contractAddress: string,
    module: string,
    functionName: string,
    typeArgs: any[],
    args: any[]
) {
    const msg = new MsgExecute(
        sender,
        contractAddress,
        module,
        functionName,
        typeArgs,
        args
    )

    return msg;
}

/**
 * Creates a message to send tokens to another address
 * 
 * @param sender - The address of the sender
 * @param contractAddress - The address of the recipient
 * @param amount - The amount of tokens to send (e.g., '1000uinit')
 * @returns A MsgSend instance for sending tokens
 */
export function sendToken(
    sender: string,
    contractAddress: string,
    amount: string,
) {
    const sendMsg = new MsgSend(
        sender,
        contractAddress,
        amount,
    )

    return sendMsg;
}

/**
 * Converts a UUID string to a U256 (bigint) representation
 * 
 * @param uuid - The UUID string to convert
 * @returns A bigint representation of the UUID
 */
export function uuidToU256(uuid: string) {
    const hex = uuid.replace(/-/g, "");
    const u256Hex = hex.padStart(64, "0");
    return toBigInt("0x" + u256Hex); // ✅ Works with ethers.js 6+
}

/**
 * Converts a U256 (bigint) representation back to a UUID string
 * 
 * @param u256 - The bigint representation of the UUID
 * @returns The UUID string
 */
export function u256ToUuid(u256: bigint): string {
    // Convert to 64-char hex string
    const fullHex = u256.toString(16).padStart(64, "0");

    // Get the lower 128 bits (last 32 hex chars)
    const uuidHex = fullHex.slice(-32);

    // Format as UUID: 8-4-4-4-12
    return [
        uuidHex.slice(0, 8),
        uuidHex.slice(8, 12),
        uuidHex.slice(12, 16),
        uuidHex.slice(16, 20),
        uuidHex.slice(20),
    ].join("-");
}
