import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox'
import { Cell, Dictionary, toNano } from 'ton-core'
import { Task2 } from '../wrappers/Task2'
import '@ton-community/test-utils'
import { compile } from '@ton-community/blueprint'

describe('Task2', () => {
    let code: Cell

    beforeAll(async () => {
        code = await compile('Task2')
    })

    let blockchain: Blockchain
    let admin: SandboxContract<TreasuryContract>
    let task2: SandboxContract<Task2>

    beforeEach(async () => {
        blockchain = await Blockchain.create()
        admin = await blockchain.treasury('admin')
        task2 = blockchain.openContract(Task2.createFromConfig({
            adminAddress: admin.address,
            users: Dictionary.empty(),
        }, code))

        const deployer = await blockchain.treasury('deployer')

        const deployResult = await task2.sendDeploy(deployer.getSender(), toNano('1.05'))

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task2.address,
            deploy: true,
            success: true,
        })
    })

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task2 are ready to use
    })

    it('should split ton', async () => {
        const usersArray = []
        for (let i = 0n; i < 10n; i += 1n) {
            const user = await blockchain.treasury('user' + i)
            usersArray.push(user)
            const result = await task2.sendAddUser(admin.getSender(), {
                value: toNano('0.01'),
                address: user.address,
                share: i + 1n,
            })
            expect(result.transactions).toHaveTransaction({
                from: admin.address,
                to: task2.address,
                success: true,
                outMessagesCount: 0,
            })
        }
        const someone = await blockchain.treasury('someone')
        const result = await task2.sendSplit(someone.getSender(), {
            value: toNano('1000'),
        })
        expect(result.transactions).toHaveTransaction({
            from: someone.address,
            to: task2.address,
            success: true,
            outMessagesCount: 10,
        })
    })
})
