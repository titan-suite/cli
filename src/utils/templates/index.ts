export const getTemplateContract = (name: string) => {
    return `pragma solidity ^0.4.9;\n\ncontract ${name} {\n\tfunction ${name}() public {}\n}`
}

export const getTemplateTest = (name: string) => {
    return `describe(\'${name}', () => {\n\tit('should assert true', async () => {\n\t\tassert.isTrue(true)\n\t})\n})`
}
