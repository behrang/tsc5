import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    Sender,
    SendMode,
} from 'ton-core'

export type Task2Config = {
    adminAddress: Address
    users: Dictionary<Address, bigint>
}

export function task2ConfigToCell(config: Task2Config): Cell {
    return beginCell().storeAddress(config.adminAddress).storeDict(config.users).endCell()
}

export class Task2 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task2(address)
    }

    static createFromConfig(config: Task2Config, code: Cell, workchain = 0) {
        const data = task2ConfigToCell(config)
        const init = { code, data }
        return new Task2(contractAddress(workchain, init), init)
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        })
    }

    async sendAddUser(provider: ContractProvider, via: Sender, opts: {
        value: bigint
        queryId?: bigint
        address: Address
        share: bigint
    }) {
        await provider.internal(via, {
            value: opts.value,
            body: beginCell()
                .storeUint(0x368ddef3, 32)
                .storeUint(opts.queryId ?? 0n, 64)
                .storeAddress(opts.address)
                .storeUint(opts.share, 32)
                .endCell()
        })
    }

    async sendRemoveUser(provider: ContractProvider, via: Sender, opts: {
        value: bigint
        queryId?: bigint
        address: Address
    }) {
        await provider.internal(via, {
            value: opts.value,
            body: beginCell()
                .storeUint(0x278205c8, 32)
                .storeUint(opts.queryId ?? 0n, 64)
                .storeAddress(opts.address)
                .endCell()
        })
    }

    async sendSplit(provider: ContractProvider, via: Sender, opts: {
        value: bigint
        queryId?: bigint
    }) {
        await provider.internal(via, {
            value: opts.value,
            body: beginCell()
                .storeUint(0x068530b3, 32)
                .storeUint(opts.queryId ?? 0n, 64)
                .endCell()
        })
    }

    async sendNotification(provider: ContractProvider, via: Sender, opts: {
        value: bigint
        queryId?: bigint
        amount: bigint
    }) {
        await provider.internal(via, {
            value: opts.value,
            body: beginCell()
                .storeUint(0x7362d09c, 32)
                .storeUint(opts.queryId ?? 0n, 64)
                .storeCoins(opts.amount)
                .endCell()
        })
    }
}
