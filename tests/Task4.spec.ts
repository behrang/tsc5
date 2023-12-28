import { Blockchain, SandboxContract } from '@ton-community/sandbox'
import { Cell, TupleBuilder, TupleItem, toNano } from 'ton-core'
import { Task4 } from '../wrappers/Task4'
import '@ton-community/test-utils'
import { compile } from '@ton-community/blueprint'

describe('Task4', () => {
    let code: Cell

    beforeAll(async () => {
        code = await compile('Task4')
    })

    let blockchain: Blockchain
    let task4: SandboxContract<Task4>

    beforeEach(async () => {
        blockchain = await Blockchain.create()

        task4 = blockchain.openContract(Task4.createFromConfig({}, code))

        const deployer = await blockchain.treasury('deployer')

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'))

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        })
    })

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task4 are ready to use
    })

    it('should solve an already solved example', async () => {
        const maze = createMaze(
            '| S | X |\n' +
            '| . | E |\n')
        const [breaks, superpositions, distance, solution ] = await task4.getSolveMaze(maze)
        expect(breaks).toEqual(0)
        expect(superpositions).toEqual(0)
        expect(distance).toEqual(1)
        expect(solution).toEqual(maze)
        })

    it('should solve example 1', async () => {
        const maze = createMaze(
            '| X | X | X | X | X | X | E | . |\n'+
            '| X | X | . | X | X | X | X | . |\n'+
            '| X | . | X | . | X | X | X | X |\n'+
            '| . | ? | X | S | X | X | X | . |\n'+
            '| ? | . | X | X | X | X | X | . |\n'+
            '| X | X | . | . | X | X | X | . |\n'+
            '| X | X | . | . | X | X | ? | X |\n'+
            '| X | X | X | . | . | . | X | X |\n')
        const expectedSolution = createMaze(
            '| X | X | X | X | X | X | E | . |\n'+
            '| X | X | ! | X | X | X | X | ! |\n'+
            '| X | ! | X | ! | X | X | X | ! |\n'+
            '| ! | ? | X | S | X | X | X | ! |\n'+
            '| ? | ! | X | X | X | X | X | ! |\n'+
            '| X | X | ! | . | X | X | X | ! |\n'+
            '| X | X | . | ! | X | X | ! | X |\n'+
            '| X | X | X | . | ! | ! | X | X |\n')
        const [breaks, superpositions, distance, solution ] = await task4.getSolveMaze(maze)
        console.log(format(maze))
        console.log(breaks, superpositions, distance, format(solution))
        expect(breaks).toEqual(1)
        expect(superpositions).toEqual(1)
        expect(distance).toEqual(16)
        expect(solution).toEqual(expectedSolution)
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
        const [breaks, superpositions, distance, solution ] = await task4.getSolveMaze(maze)
        expect(breaks).toEqual(0)
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
        const [breaks, superpositions, distance, solution ] = await task4.getSolveMaze(maze)
        expect(breaks).toEqual(0)
        expect(superpositions).toEqual(0)
        expect(distance).toEqual(16)
        expect(solution).toEqual(expectedSolution)
    })

    it('should solve another example 4', async () => {
        const maze = createMaze(
            '| . | X | . | . | . | E |\n' +
            '| . | X | . | X | X | X |\n' +
            '| . | X | X | . | . | . |\n' +
            '| . | X | X | X | X | X |\n' +
            '| S | . | . | . | . | . |\n')
        const expectedSolution = createMaze(
            '| . | X | . | ! | ! | E |\n' +
            '| . | X | ! | X | X | X |\n' +
            '| . | ! | X | . | . | . |\n' +
            '| ! | X | X | X | X | X |\n' +
            '| S | . | . | . | . | . |\n')
        const [breaks, superpositions, distance, solution ] = await task4.getSolveMaze(maze)
        expect(breaks).toEqual(1)
        expect(superpositions).toEqual(0)
        expect(distance).toEqual(6)
        expect(solution).toEqual(expectedSolution)
    })

    it('should solve another example 5', async () => {
        const maze = createMaze(
            '............................X.E\n' +
            '............................X..\n' +
            '............................XXX\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            '...............................\n' +
            'XXX............................\n' +
            '..X............................\n' +
            'S.X............................\n')
        const expectedSolution = createMaze(
            '............................X.E\n' +
            '............................X!.\n' +
            '............................!XX\n' +
            '...........................!...\n' +
            '..........................!....\n' +
            '.........................!.....\n' +
            '........................!......\n' +
            '.......................!.......\n' +
            '......................!........\n' +
            '.....................!.........\n' +
            '....................!..........\n' +
            '...................!...........\n' +
            '..................!............\n' +
            '.................!.............\n' +
            '................!..............\n' +
            '...............!...............\n' +
            '..............!................\n' +
            '.............!.................\n' +
            '............!..................\n' +
            '...........!...................\n' +
            '..........!....................\n' +
            '.........!.....................\n' +
            '........!......................\n' +
            '.......!.......................\n' +
            '......!........................\n' +
            '.....!.........................\n' +
            '....!..........................\n' +
            '...!...........................\n' +
            'XX!............................\n' +
            '.!X............................\n' +
            'S.X............................\n')
        const [breaks, superpositions, distance, solution ] = await task4.getSolveMaze(maze)
        console.log(format(maze))
        console.log(breaks, superpositions, distance, format(solution))
        expect(breaks).toEqual(2)
        expect(superpositions).toEqual(0)
        expect(distance).toEqual(30)
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
