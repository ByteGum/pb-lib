interface EntityConfigOption {
  fillables: [];
  updateFillables: [];
  uniques: [];
  softDelete: boolean;
  hiddenFields: [];
}

export class EntityConfig {
  public _id;
  public deleted: boolean;
  public publicId: string;
  public iDToken = 'kol';

  protected fillables = [];
  protected updateFillables = [];
  protected uniques = [];
  protected softDelete = true;
  protected hiddenFields = [];

  /**
   * @param {String} options The payload config to override current
   * @param {String} configuration The payload config to override current
   * @return {Object} config
   */
  public config(options: any = {}, configuration: any = {}): EntityConfigOption {
    let config = Object.assign(
      {
        fillables: this.fillables,
        updateFillables: this.updateFillables,
        uniques: this.uniques,
        softDelete: this.softDelete,
      },
      options,
    );
    if (
      configuration.environment &&
      configuration.environment === 'production'
    ) {
      config = Object.assign(config, {
        hiddenFields: this.hiddenFields,
      });
    }
    return config;
  }

  public searchQuery(q) {
    return [];
  }
}
