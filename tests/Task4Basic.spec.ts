import { Blockchain, SandboxContract } from '@ton-community/sandbox'
import { Cell, TupleBuilder, TupleItem, toNano } from 'ton-core'
import { Task4Basic } from '../wrappers/Task4Basic'
import '@ton-community/test-utils'
import { compile } from '@ton-community/blueprint'

describe('Task4Basic', () => {
    let code: Cell

    beforeAll(async () => {
        code = await compile('Task4Basic')
    })

    let blockchain: Blockchain
    let task4Basic: SandboxContract<Task4Basic>

    beforeEach(async () => {
        blockchain = await Blockchain.create()

        task4Basic = blockchain.openContract(Task4Basic.createFromConfig({}, code))

        const deployer = await blockchain.treasury('deployer')

        const deployResult = await task4Basic.sendDeploy(deployer.getSender(), toNano('0.05'))

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4Basic.address,
            deploy: true,
            success: true,
        })
    })

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task4Basic are ready to use
    })

    it('should solve an already solved example', async () => {
        const maze = createMaze(
            '| S | X |\n' +
            '| . | E |\n')
        const [breaks, superpositions, distance, solution ] = await task4Basic.getSolveMaze(maze)
        expect(breaks).toEqual(-1)
        expect(superpositions).toEqual(0)
        expect(distance).toEqual(1)
        expect(solution).toEqual(maze)
        })

    it('should reject example 1', async () => {
        const maze = createMaze(
            '| X | X | X | X | X | X | E | . |\n'+
            '| X | X | . | X | X | X | X | . |\n'+
            '| X | . | X | . | X | X | X | X |\n'+
            '| . | ? | X | S | X | X | X | . |\n'+
            '| ? | . | X | X | X | X | X | . |\n'+
            '| X | X | . | . | X | X | X | . |\n'+
            '| X | X | . | . | X | X | ? | X |\n'+
            '| X | X | X | . | . | . | X | X |\n')
        const [breaks, superpositions, distance, solution ] = await task4Basic.getSolveMaze(maze)
        expect(breaks).toEqual(-1)
        expect(superpositions).toEqual(0)
        expect(distance).toEqual(0)
        expect(solution).toBeNull()
    })

    it('should solve example 2', async () => {
        const maze = createMaze(
            '| S | X | . | ? | X |\n' +
            '| . | X | X | . | X |\n' +
            '| X | . | ? | . | . |\n' +
            '| . | ? | ? | . | . |\n' +
            '| X | ? | . | . | . |\n' +
            '| . | . | X | . | X |\n' +
            '| . | . | ? | . | . |\n' +
            '| X | . | . | . | E |\n')
        const expectedSolution = createMaze(
            '| S | X | . | ? | X |\n' +
            '| ! | X | X | . | X |\n' +
            '| X | ! | ? | . | . |\n' +
            '| . | ! | ? | . | . |\n' +
            '| X | ? | ! | . | . |\n' +
            '| . | . | X | ! | X |\n' +
            '| . | . | ? | ! | . |\n' +
            '| X | . | . | . | E |\n')
        const [breaks, superpositions, distance, solution ] = await task4Basic.getSolveMaze(maze)
        expect(breaks).toEqual(-1)
        expect(superpositions).toEqual(1)
        expect(distance).toEqual(7)
        expect(solution != null).toBeTruthy()
    })

    it('should solve another example 3', async () => {
        const maze = createMaze(
            '| X | X | X | X | X | X | E | . |\n' +
            '| X | X | . | X | X | X | X | . |\n' +
            '| X | . | X | . | X | X | X | . |\n' +
            '| . | ? | X | S | X | X | X | . |\n' +
            '| ? | . | X | X | X | X | X | . |\n' +
            '| X | X | . | ? | X | X | X | . |\n' +
            '| X | X | ? | . | X | X | . | X |\n' +
            '| X | X | X | ? | . | . | X | X |\n')
        const expectedSolution = createMaze(
            '| X | X | X | X | X | X | E | . |\n' +
            '| X | X | ! | X | X | X | X | ! |\n' +
            '| X | ! | X | ! | X | X | X | ! |\n' +
            '| ! | ? | X | S | X | X | X | ! |\n' +
            '| ? | ! | X | X | X | X | X | ! |\n' +
            '| X | X | ! | ? | X | X | X | ! |\n' +
            '| X | X | ? | ! | X | X | ! | X |\n' +
            '| X | X | X | ? | ! | ! | X | X |\n')
        const [breaks, superpositions, distance, solution ] = await task4Basic.getSolveMaze(maze)
        expect(breaks).toEqual(-1)
        expect(superpositions).toEqual(0)
        expect(distance).toEqual(16)
        expect(solution).toEqual(expectedSolution)
    })
})

function createMaze(input: string): TupleItem[] {
    const tb = new TupleBuilder()
    const lines = input.replace(/[^.X?SE!\n]/g, '').trim().split('\n')
    for (const line of lines) {
        tb.writeTuple(
            line.split('').map((c: string) => ({ type: 'int', value: BigInt(c.charCodeAt(0))}))
        )
    }
    return tb.build()
}

function format(maze: TupleItem[] | null): string {
    let lines = ''
    if (maze != null) {
        for (const row of maze) {
            if (row.type == 'tuple') {
                const line = []
                for (const col of row.items) {
                    if (col.type == 'int') {
                        line.push(String.fromCharCode(Number(col.value)))
                    }
                }
                lines += '\n' + line.join(' ')
            }
        }
    }
    return lines
}
