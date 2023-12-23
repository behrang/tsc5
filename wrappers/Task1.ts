import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    Slice,
} from 'ton-core'

export type Task1Config = {
    publicKey: bigint
    executionTime: bigint
    receiver: Address
    seqno: bigint
}

export function task1ConfigToCell(config: Task1Config): Cell {
    return beginCell()
        .storeUint(config.publicKey, 256)
        .storeUint(config.executionTime, 32)
        .storeAddress(config.receiver)
        .storeUint(config.seqno, 32)
        .endCell()
}

export class Task1 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task1(address)
    }

    static createFromConfig(config: Task1Config, code: Cell, workchain = 0) {
        const data = task1ConfigToCell(config)
        const init = { code, data }
        return new Task1(contractAddress(workchain, init), init)
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        })
    }

    async sendUpdate(provider: ContractProvider, queryId: bigint, signature: Buffer, lockedFor: bigint, newSeqno: bigint) {
        const message = beginCell()
            .storeUint(0x9df10277, 32)
            .storeUint(queryId, 64)
            .storeBuffer(signature)
            .storeRef(beginCell().storeUint(lockedFor, 32).storeUint(newSeqno, 32))
            .endCell()
        await provider.external(message)
    }

    async sendClaim(provider: ContractProvider, queryId: bigint) {
        const message = beginCell()
            .storeUint(0xbb4be234, 32)
            .storeUint(queryId, 64)
            .endCell()
        await provider.external(message)
    }

    async getSeqno(provider: ContractProvider): Promise<bigint> {
        const { stack } = await provider.get('get_seqno', [])
        return stack.readBigNumber()
    }

    async getExecutionTime(provider: ContractProvider): Promise<bigint> {
        const { stack } = await provider.get('get_execution_time', [])
        return stack.readBigNumber()
    }
}
