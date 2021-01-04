import { Document } from 'mongoose';
import * as _ from 'lodash';
import { Utils } from '../utils/utils';
import { ResponseOption } from '../interfaces/response-option';
import { AppResponse, Pagination, QueryParser } from '../common';
import { AppException } from '../exceptions/app-exception';

export class BaseService<T extends Document> {
  public routes = {
    create: true,
    findOne: true,
    find: true,
    update: true,
    patch: true,
    remove: true,
  };
  public readonly modelName: string;
  public baseUrl: string = 'localhost:3000';
  public itemsPerPage: number = 10;
  public entity;

  private defaultConfig: any = {
    config: () => {
      return {
        softDelete: false,
        uniques: [],
        returnDuplicate: false,
        fillables: [],
        updateFillables: [],
        hiddenFields: ['deleted'],
      };
    },
  };

  constructor(
    protected readonly model: any,
  ) {
    this.modelName = model.collection.collectionName;
    this.entity = model;
    if (!this.entity.config) {
      this.entity.config = this.defaultConfig.config;
    }
  }

  public get Model() {
    return this.model;
  }

  /**
   * @param {Object} obj required for response
   * @return {Object}
   */
  async validateCreate(obj) {
    return null;
  }

  /**
   * @param {Object} obj required for response
   * @return {Object}
   */
  async validateDelete(obj) {
    return null;
  }

  /**
   * @param {Object} current required for response
   * @param {Object} obj required for response
   * @return {Object}
   */
  async validateUpdate(current, obj: any) {
    return null;
  }

  /**
   * @param {Object} obj The payload object
   * @param {Object} session The payload object
   * @return {Object}
   */
  public async createNewObject(obj, session?) {
    const tofill = this.entity.config().fillables;
    if (tofill && tofill.length > 0) {
      obj = _.pick(obj, ...tofill);
    }
    const data = new this.model({
      ...obj,
      publicId: Utils.generateUniqueId(this.entity.config().iDToken),
    });
    return data.save();
  }

  /**
   * @param {Object} id The payload object
   * @param {Object} obj The payload object
   * @return {Object}
   */
  async updateObject(id, obj) {
    const tofill = this.entity.config().fillables;
    if (tofill && tofill.length > 0) {
      obj = _.pick(obj, ...tofill);
    }
    return this.model.findOneAndUpdate(
      { publicId: id },
      { ...obj },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  /**
   * @param {Object} current The payload object
   * @param {Object} obj The payload object
   * @return {Object}
   */
  async patchUpdate(current, obj) {
    const tofill = this.entity.config().updateFillables;
    if (tofill && tofill.length > 0) {
      obj = _.pick(obj, ...tofill);
    }
    _.extend(current, obj);
    return current.save();
  }

  /**
   * @param {String} id The payload object
   * @param {QueryParser} queryParser The payload object
   * @return {Object}
   */
  public async findObject(id, queryParser: QueryParser = null) {
    const condition: any = { $or: [{ publicId: id }, { _id: id }], deleted: false };
    const object: any = await this.model.findOne(condition);
    if (!object) {
      throw AppException.NOT_FOUND;
    }
    return object;
  }

  /**
   * @param {Object} object The payload object
   * @return {Object}
   */
  public async deleteObject(object) {
    if (this.entity.config().softDelete) {
      _.extend(object, { deleted: true });
      object = await object.save();
    } else {
      object = await object.remove();
    }
    if (!object) {
      AppException.NOT_FOUND;
    }
    return object;
  }


  /**
   * @param {ResponseOption} option: required email for search
   * @return {Object} The formatted response
   */
  public async getResponse(option: ResponseOption) {
    try {
      const meta: any = AppResponse.getSuccessMeta();
      if (option.token) {
        meta.token = option.token;
      }
      Object.assign(meta, { statusCode: option.code });
      if (option.message) {
        meta.message = option.message;
      }
      if (option.value && option.queryParser && option.queryParser.population) {
        option.value = await this.model.populate(
          option.value,
          option.queryParser.population,
        );
      }
      if (option.pagination && !option.queryParser.getAll) {
        option.pagination.totalCount = option.count;
        if (option.pagination.morePages(option.count)) {
          option.pagination.next = option.pagination.current + 1;
        }
        meta.pagination = option.pagination.done();
      }
      if (
        this.entity.config().hiddenFields &&
        this.entity.config().hiddenFields.length
      ) {
        const isFunction = typeof option.value.toJSON === 'function';
        if (Array.isArray(option.value)) {
          option.value = option.value.map((v) =>
            typeof v === 'string'
              ? v
              : _.omit(
              isFunction ? v.toJSON() : v,
              ...this.entity.config().hiddenFields,
              ),
          );
        } else {
          option.value = _.omit(
            isFunction ? option.value.toJSON() : option.value,
            ...this.entity.config().hiddenFields,
          );
        }
      }
      return AppResponse.format(meta, option.value);
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {Object} model The model object
   * @param {Object} options The payload object
   * @return {Object}
   */
  public async populate(model: any, options: any) {
    return this.model.populate(model, options);
  }

  /**
   * @param {Object} obj The payload object
   * @param {Object} session The payload object
   * @return {Object}
   */
  public async findQuery(obj, session = null) {
    const tofill = this.entity.config().fillables;
    if (tofill && tofill.length > 0) {
      obj = _.pick(obj, ...tofill);
    }
    return new this.model(obj).save();
  }

  /**
   * @param {Pagination} pagination The pagination object
   * @param {QueryParser} queryParser The query parser
   * @return {Object}
   */
  async buildModelQueryObject(
    pagination: Pagination,
    queryParser: QueryParser = null,
  ) {
    console.log('queryParser.query ::::: ', queryParser.query);
    let query = this.model.find(queryParser.query);
    if (
      queryParser.search && this.entity.searchQuery &&
      this.entity.searchQuery(queryParser.search).length > 0
    ) {
      const searchQuery = this.entity.searchQuery(queryParser.search);
      queryParser.query = {
        $or: [...searchQuery],
        ...queryParser.query,
      };
      query = this.model.find({ ...queryParser.query });
    }
    if (!queryParser.getAll) {
      query = query.skip(pagination.skip).limit(pagination.perPage);
    }
    query = query.sort(
      queryParser && queryParser.sort
        ? Object.assign(queryParser.sort, { createdAt: -1 })
        : '-createdAt',
    );
    return {
      value: await query.select(queryParser.selection).exec(),
      count: await this.model.countDocuments(queryParser.query).exec(),
    };
  }

  /**
   * @param {Object} queryParser The query parser
   * @return {Object}
   */
  async buildSearchQuery(queryParser = null) {
    return _.omit(queryParser.query, ['deleted']);
  }

  /**
   * @param {Object} query The query object
   * @return {Promise<Object>}
   */
  async countQueryDocuments(query) {
    let count = await this.model.aggregate(query.concat([{ $count: 'total' }]));
    count = count[0] ? count[0].total : 0;
    return count;
  }

  /**
   * @param {Object} pagination The pagination object
   * @param {Object} query The query
   * @param {Object} queryParser The query parser
   * @return {Object}
   */
  async buildModelAggregateQueryObject(pagination, query, queryParser = null) {
    const count = await this.countQueryDocuments(query);
    query.push({
      $sort: queryParser.sort
        ? Object.assign({}, { ...queryParser.sort, createdAt: -1 })
        : { createdAt: -1 },
    });
    if (!queryParser.getAll) {
      query.push(
        {
          $skip: pagination.skip,
        },
        {
          $limit: pagination.perPage,
        },
      );
    }
    return {
      value: await this.model
        .aggregate(query)
        .collation({ locale: 'en', strength: 1 }),
      count,
    };
  }

  /**
   * @param {Object} obj The request object
   * @return {Promise<Object>}
   */
  public async retrieveExistingResource(obj) {
    if (this.entity.config().uniques) {
      const uniqueKeys = this.entity.config().uniques;
      const query = {};
      for (const key of uniqueKeys) {
        query[key] = obj[key];
      }
      const found = await this.model.findOne({ ...query, deleted: false, active: true });
      if (found) {
        return found;
      }
    }
    return null;
  }
}
