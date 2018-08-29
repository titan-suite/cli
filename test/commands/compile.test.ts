import { expect, test } from '@oclif/test'

describe('compile', () => {
    test
        .stdout()
        .command(['compile', 'test/contracts/Example.sol'])
        .it('runs compile test/contracts/Example.sol', ctx => {
            expect(ctx.stdout).to.contain('<<{0} Example>>')
        })

    test
        .stdout()
        .command(['compile', '-d', 'test/contracts/Example.sol'])
        .it('runs compile -d test/contracts/Example.sol', ctx => {
            expect(ctx.stdout).to.contain('code')
            expect(ctx.stdout).to.contain('abiDefinition')
            expect(ctx.stdout).to.contain('"compilerVersion": "0.4.15+commit.ecf81ee5.Linux.g++"')
        })

    test
        .stdout()
        .command(['compile', '-n', 'Owned', 'test/contracts/Many.sol'])
        .it('runs compile -n Owned test/contracts/Many.sol', ctx => {
            expect(ctx.stdout).to.contain('"type": "constructor"')
        })

    test
        .stdout()
        .command(['compile', '-d', '-n', 'Many', 'test/contracts/Many.sol'])
        .it('runs compile -d -n Many test/contracts/Many.sol', ctx => {
            expect(ctx.stdout).to.contain('code')
            expect(ctx.stdout).to.contain('abiDefinition')
            expect(ctx.stdout).to.contain('"compilerVersion": "0.4.15+commit.ecf81ee5.Linux.g++"')
            expect(ctx.stdout).to.contain('function Many(string _name)')
        })
})
