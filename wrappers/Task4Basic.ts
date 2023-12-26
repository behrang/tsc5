import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Tuple, TupleBuilder, TupleItem, TupleReader } from 'ton-core'

export type Task4BasicConfig = {}

export function task4BasicConfigToCell(config: Task4BasicConfig): Cell {
    return beginCell().endCell()
}

export class Task4Basic implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task4Basic(address)
    }

    static createFromConfig(config: Task4BasicConfig, code: Cell, workchain = 0) {
        const data = task4BasicConfigToCell(config)
        const init = { code, data }
        return new Task4Basic(contractAddress(workchain, init), init)
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        })
    }

    async getSolveMaze(provider: ContractProvider, maze: TupleItem[]): Promise<[number, number, number, TupleItem[] | null]> {
        const n = maze.length
        const m = (maze[0] as Tuple).items.length
        const tb = new TupleBuilder()
        tb.writeNumber(n)
        tb.writeNumber(m)
        tb.writeTuple(maze)
        const { stack } = await provider.get('solve_maze', tb.build())
        const remove = stack.readNumber()
        const superpositions = stack.readNumber()
        const distance = stack.readNumber()
        let tr: TupleReader | null = stack.readTupleOpt()
        let solution: TupleItem[] | null = null
        if (tr != null) {
            solution = []
            while (tr.remaining > 0) {
                solution.push(tr.pop())
            }
        }
        return [ remove, superpositions, distance, solution ]
    }
}
