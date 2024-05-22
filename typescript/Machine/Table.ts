class Table extends TileEntityBase {
  public static recipe_list: { input: int; output: int }[] = [];
  public static registerPressRecipe(input: int, output: int): void {
    Table.recipe_list.push({ input, output });
  }
  public defaultValues = {
    id: 0,
  };
  public static validateItem(input_id: int): boolean {
    for (const list of Table.recipe_list) {
      if (list.input === input_id || input_id === 0) return true;
    }
    return false;
  }
  @BlockEngine.Decorators.NetworkEvent(Side.Client)
  public updateVisual(data: { id: int }) {
    const animation = this["animation"] as Animation.Item;
    animation &&
      animation.describeItem({
        id: data.id,
        count: 1,
        data: 0,
        size: 0.4,
        rotation: [Math.PI / 2, 0, 0],
      });
    animation.load();
  }
  protected itemManipulate(item: ItemInstance, entity: int) {
    const player = new PlayerEntity(entity);
    if (player.getCarriedItem().id === 0 && this.data.id !== 0) {
      const id = this.data.id;
      this.sendPacket("updateVisual", { id: 0 });
      return player.setCarriedItem(new ItemStack(id, 1, 0));
    } else {
      const id = player.getCarriedItem().id;
      this.data.id = id;
      this.sendPacket("updateVisual", { id });
      return player.decreaseCarriedItem(1);
    }
  }
  public onItemUse(
    coords: Callback.ItemUseCoordinates,
    item: ItemStack,
    player: number
  ): any {
    if (!Table.validateItem(item.id) || Entity.getSneaking(player) === true) {
      return MachineBlock.takeParticles({
        x: this.x,
        y: this.y + 0.5,
        z: this.z,
      });
    }
    this.networkData.putInt("id", item.id);
    return this.itemManipulate(item, player);
  }
  clientLoad(): void {
    const animation = (this["animation"] = new Animation.Item(
      this.x + 0.5,
      this.y + 1.05,
      this.z + 0.5
    ) as Animation.Item);
    animation.load();
  }
  clientUnload(): void {
    const id = this.networkData.getInt("id");
    id !== 0 &&
      this.blockSource.spawnDroppedItem(this.x, this.y + 1, this.z, id, 1, 0);
    const animation = this["animation"] as Animation.Item;
    animation && animation.destroy();
  }
}

const TABLE = new MachineBlock("engineer_table", [
  {
    texture: [["stone_slab_top", 0]],
    name: "block.airborne_skies.engineer_table",
    inCreative: true,
  },
]);

TABLE.createWithRotation();
TABLE.setupModel("engineer_table", "table");
TABLE.setupLogic(new Table());
Table.registerPressRecipe(VanillaItemID.coal, VanillaItemID.diamond);
