import {expect, test} from '@oclif/test'

describe('unlock', () => {
    test
        .stdout()
        .command(['unlock', '-a', '0xa076b66cb825ca43aab11aa807ced2586023e6a62d8d600b0f3e16445a8d3ced', '-p', 'PLAT4life'])
        .it('runs unlock', async ctx => {
            expect(ctx.stdout).to.contain('unlocked')
        })
})
