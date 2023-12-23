import { Blockchain, SandboxContract, TreasuryContract, createShardAccount } from '@ton-community/sandbox'
import { BitBuilder, BitString, Cell, Slice, beginCell, toNano } from 'ton-core'
import { Task1, task1ConfigToCell } from '../wrappers/Task1'
import '@ton-community/test-utils'
import { compile } from '@ton-community/blueprint'
import { KeyPair, mnemonicToPrivateKey, sign } from 'ton-crypto'
import { fail } from 'assert'

describe('Task1', () => {
    let code: Cell

    beforeAll(async () => {
        code = await compile('Task1')
    })

    let blockchain: Blockchain
    let keyPair: KeyPair
    let receiver: SandboxContract<TreasuryContract>
    let task1: SandboxContract<Task1>

    beforeEach(async () => {
        blockchain = await Blockchain.create()
        keyPair = await mnemonicToPrivateKey('private key'.split(' '))
        receiver = await blockchain.treasury('receiver')

        task1 = blockchain.openContract(
            Task1.createFromConfig(
                {
                    publicKey: BigInt('0x' + keyPair.publicKey.toString('hex')),
                    executionTime: BigInt(Math.floor(Date.now() / 1000)) + 5n,
                    receiver: receiver.address,
                    seqno: 1n,
                },
                code,
            ),
        )

        const deployer = await blockchain.treasury('deployer')

        const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'))

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1.address,
            deploy: true,
            success: true,
        })
    })

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task1 are ready to use
    })

    it('should return seqno', async () => {
        const seqno = await task1.getSeqno()
        expect(seqno).toEqual(1n)
    })

    it('should return execution time', async () => {
        const executionTime = await task1.getExecutionTime()
        expect(executionTime).toBeGreaterThan(BigInt(Math.floor(Date.now() / 1000)))
        expect(executionTime).toBeLessThanOrEqual(BigInt(Math.floor(Date.now() / 1000)) + 5n)
    })

    it('should throw error 119', async () => {
        const seqno = await task1.getSeqno()
        const newSeqno = seqno
        const lockedFor = 0n
        const data = beginCell().storeUint(lockedFor, 32).storeUint(newSeqno, 32).endCell().hash()
        const signature = sign(data, keyPair.secretKey)
        try {
            await task1.sendUpdate(signature, lockedFor, newSeqno)
            fail('expected an error to be thrown')
        } catch (e: any) {
            expect(e.exitCode).toEqual(119)
        }
    })

    it('should throw error 120', async () => {
        const seqno = await task1.getSeqno()
        const newSeqno = seqno + 1n
        const lockedFor = 0n
        const data = beginCell().storeUint(lockedFor, 32).storeUint(newSeqno, 32).endCell().hash()
        const anotherKeyPair = await mnemonicToPrivateKey('another private key'.split(' '))
        const signature = sign(data, anotherKeyPair.secretKey)
        try {
            await task1.sendUpdate(signature, lockedFor, newSeqno)
            fail('expected an error to be thrown')
        } catch (e: any) {
            expect(e.exitCode).toEqual(120)
        }
    })

    it('should throw error 121', async () => {
        const seqno = await task1.getSeqno()
        const newSeqno = seqno + 1n
        const lockedFor = 0n
        const data = beginCell().storeUint(lockedFor, 32).storeUint(newSeqno, 32).endCell().hash()
        const signature = sign(data, keyPair.secretKey)
        try {
            await task1.sendUpdate(signature, lockedFor, newSeqno)
            fail('expected an error to be thrown')
        } catch (e: any) {
            expect(e.exitCode).toEqual(121)
        }
    })

    it('should throw error 122', async () => {
        await blockchain.setShardAccount(
            task1.address,
            createShardAccount({
                code,
                data: task1ConfigToCell({
                    publicKey: BigInt('0x' + keyPair.publicKey.toString('hex')),
                    executionTime: BigInt(Math.floor(Date.now() / 1000)) - 1n,
                    receiver: receiver.address,
                    seqno: 1n,
                }),
                address: task1.address,
                workchain: 0,
                balance: toNano('1'),
            }),
        )
        const seqno = await task1.getSeqno()
        const newSeqno = seqno + 1n
        const lockedFor = 10n
        const data = beginCell().storeUint(lockedFor, 32).storeUint(newSeqno, 32).endCell().hash()
        const signature = sign(data, keyPair.secretKey)
        try {
            await task1.sendUpdate(signature, lockedFor, newSeqno)
            fail('expected an error to be thrown')
        } catch (e: any) {
            expect(e.exitCode).toEqual(122)
        }
    })

    it('should throw error 123', async () => {
        const seqno = await task1.getSeqno()
        const newSeqno = seqno + 1n
        const lockedFor = 2n
        const data = beginCell().storeUint(lockedFor, 32).storeUint(newSeqno, 32).endCell().hash()
        const signature = sign(data, keyPair.secretKey)
        try {
            await task1.sendUpdate(signature, lockedFor, newSeqno)
            fail('expected an error to be thrown')
        } catch (e: any) {
            expect(e.exitCode).toEqual(123)
        }
    })

    it('should update execution time and seqno', async () => {
        const seqno = await task1.getSeqno()
        const newSeqno = seqno + 1n
        const lockedFor = 10n
        const data = beginCell().storeUint(lockedFor, 32).storeUint(newSeqno, 32).endCell().hash()
        const signature = sign(data, keyPair.secretKey)
        const result = await task1.sendUpdate(signature, lockedFor, newSeqno)
        expect(result.transactions).toHaveTransaction({
            to: task1.address,
            success: true,
        })
        expect(result.transactions).toHaveLength(1)

        const updatedExecutionTime = await task1.getExecutionTime()
        expect(updatedExecutionTime).toEqual(BigInt(Math.floor(Date.now() / 1000)) + 10n)

        const updatedSeqno = await task1.getSeqno()
        expect(updatedSeqno).toEqual(newSeqno)
    })

    it('should throw error 124', async () => {
        try {
            await task1.sendClaim()
            fail('expected an error to be thrown')
        } catch (e: any) {
            expect(e.exitCode).toEqual(124)
        }
    })

    it('should send all balance to receiver', async () => {
        await blockchain.setShardAccount(
            task1.address,
            createShardAccount({
                code,
                data: task1ConfigToCell({
                    publicKey: BigInt('0x' + keyPair.publicKey.toString('hex')),
                    executionTime: BigInt(Math.floor(Date.now() / 1000)) - 1n,
                    receiver: receiver.address,
                    seqno: 1n,
                }),
                address: task1.address,
                workchain: 0,
                balance: toNano('10'),
            }),
        )
        const result = await task1.sendClaim()
        expect(result.transactions).toHaveTransaction({
            to: task1.address,
            success: true,
            outMessagesCount: 1,
        })
        expect(result.transactions).toHaveTransaction({
            from: task1.address,
            to: receiver.address,
            success: true,
            outMessagesCount: 0,
        })
        expect(result.transactions).toHaveLength(2)
    })
})
