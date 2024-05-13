class MachineBlock extends SkyBlock {
  public static machine_list = [];
  constructor(id, data) {
    super(id, data);
    this.createWithRotation();
    Block.setDestroyTime(this.id, -1), this.destroyIfCondition();
    MachineBlock.machine_list.push(BlockID[this.id]);
  }
  public static takeParticles(coords: Callback.ItemUseCoordinates) {
    const particle_list = MathHelper.randomValue(
      EParticleType.REDSTONE,
      EParticleType.CRIT
    );
    for (let i = 0; i < 8; i++) {
      const velocity = Math.random() / i;
      Particles.addParticle(
        particle_list,
        coords.x + Math.random(),
        coords.y + Math.random(),
        coords.z + Math.random(),
        velocity,
        velocity,
        velocity
      );
    }
  }
  public static crossParticles(
    coords: Callback.ItemUseCoordinates,
    player: int
  ) {
    const entity = new PlayerEntity(player);
    if (MathHelper.randomInt(0, 100) <= 1) {
      return Particles.addParticle(
        ESkiesParticle.CROSS,
        Math.random() / 10,
        coords.y + 0.9,
        Math.random() / 10,
        0,
        0.01,
        0
      ),
      entity.setSelectedSlot(MathHelper.randomInt(0, 8));
    };
    return;
  }
  protected destroyIfCondition() {
    Block.registerClickFunction(this.id, (coords, item, block, player) => {
      const entity = new PlayerEntity(player);
      if (
        Entity.getSneaking(player) === true &&
        entity.getCarriedItem().id === 0
      ) {
        const region = BlockSource.getDefaultForActor(player);
        entity.setCarriedItem({ id: block.id, count: 1, data: 0 });
        region.setBlock(coords.x, coords.y, coords.z, 0, 0);
    }
  });
  }
  static {
    Callback.addCallback("DestroyBlockContinue", (coords, block, player) => {
      if (MachineBlock.machine_list.includes(block.id))
        return MachineBlock.crossParticles(coords, player);
    });
  }
}

new MachineBlock("particle_collector", [
  {
    name: "block.airborne_skies.particle_collector",
    texture: [
      ["particle_collector", 0],
      ["particle_collector", 0],
      ["particle_collector", 0],
      ["particle_collector", 0],
      ["particle_collector", 0],
      ["particle_collector", 0],
    ],
    inCreative: true,
  },
]);
