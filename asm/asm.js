export default (ASM) => {
  const { desc } = ASM;
  ASM.injectBuilder(
    'net/minecraft/client/renderer/InventoryEffectRenderer',
    'updateActivePotionEffects',
    desc('V'),
    ASM.At(ASM.At.HEAD)
  )
  .methodMaps({
    updateActivePotionEffects: 'func_175378_g',
    func_175378_g: 'updateActivePotionEffects'
  })
  .instructions(($) => {
    $.methodReturn();
  })
  .execute()
}