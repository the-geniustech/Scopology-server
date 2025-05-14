import { Query, Document, PopulateOptions } from "mongoose";
import { URLSearchParams } from "url";
import { ParsedQs } from "qs";

export class APIFeatures<T> {
  private query: Query<T[], T>;
  private queryString: Record<string, any>;
  private page = 1;
  private limit = 20;

  constructor(query: Query<T[], T>, queryString: Record<string, any>) {
    this.query = query;
    this.queryString = queryString;
  }

  async applyAllFiltersWithPaginationMeta(baseUrl?: string): Promise<{
    data: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
      next?: string;
      prev?: string;
    };
  }> {
    this.filter().sort().limitFields().paginate();

    const [results, total] = await Promise.all([
      this.query,
      this.query.model.countDocuments(this.query.getFilter()),
    ]);

    const pages = Math.ceil(total / this.limit);

    const queryParams = new URLSearchParams(this.queryString);
    queryParams.set("limit", String(this.limit));

    const next =
      this.page < pages
        ? `${baseUrl}?${queryParams.toString().replace(/page=\d+/, "")}&page=${
            this.page + 1
          }`
        : undefined;

    const prev =
      this.page > 1
        ? `${baseUrl}?${queryParams.toString().replace(/page=\d+/, "")}&page=${
            this.page - 1
          }`
        : undefined;

    return {
      data: results,
      pagination: {
        total,
        page: this.page,
        limit: this.limit,
        pages,
        next,
        prev,
      },
    };
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|ne|in|nin)\b/g,
      (match) => `$${match}`
    );

    const parsed = JSON.parse(queryStr);
    this.query = this.query.find(parsed);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    this.page = parseInt(this.queryString.page, 10) || 1;
    this.limit = parseInt(this.queryString.limit, 10) || 20;
    const skip = (this.page - 1) * this.limit;

    this.query = this.query.skip(skip).limit(this.limit);
    return this;
  }
}

export class AdvancedAPIFeatures<T extends Document> {
  private query: Query<T[], T>;
  private queryString: Record<string, any>;
  private page: number;
  private limit: number;
  private populateMap: Map<string, string> = new Map();

  constructor(query: Query<T[], T>, queryString: Record<string, any>) {
    this.query = query;
    this.queryString = queryString;
    this.page = parseInt(queryString.page || "1", 10);
    this.limit = parseInt(queryString.limit || "20", 10);
  }

  filter() {
    const filters = { ...this.queryString };

    // Reserved keys
    const reserved = ["page", "limit", "sort", "fields"];
    Object.keys(filters).forEach((key) => {
      if (reserved.includes(key) || key.startsWith("fields[")) {
        delete filters[key];
      }
    });

    // Flatten nested filters
    const formattedQuery: Record<string, any> = {};
    for (const [key, value] of Object.entries(filters)) {
      const match = key.match(/^(\w+)\[(.+)\]$/); // nested e.g. scope[status]
      if (match) {
        const [, parent, child] = match;
        formattedQuery[`${parent}.${child}`] = value;
      } else {
        formattedQuery[key] = value;
      }
    }

    this.query = this.query.find(formattedQuery);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    const baseFields = this.queryString.fields;
    if (baseFields) {
      const fields = baseFields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    // Populate-specific fields: fields[client], fields[scope] etc.
    Object.entries(this.queryString).forEach(([key, val]) => {
      const match = key.match(/^fields\[(\w+)\]$/);
      if (match) {
        const [, path] = match;
        const selectedFields = (val as string).split(",").join(" ");
        this.populateMap.set(path, selectedFields);
      }
    });

    return this;
  }

  applyPopulation() {
    const populateOptions: PopulateOptions[] = [];

    this.populateMap.forEach((fields, path) => {
      populateOptions.push({ path, select: fields });
    });

    if (populateOptions.length > 0) {
      this.query = this.query.populate(populateOptions);
    }

    return this;
  }

  paginate() {
    const skip = (this.page - 1) * this.limit;
    this.query = this.query.skip(skip).limit(this.limit);
    return this;
  }

  async applyAll(baseUrl?: string): Promise<{
    data: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
      next?: string;
      prev?: string;
    };
  }> {
    this.filter().sort().limitFields().applyPopulation().paginate();

    const [results, total] = await Promise.all([
      this.query.exec(),
      this.query.model.countDocuments(this.query.getFilter()),
    ]);

    const pages = Math.ceil(total / this.limit);

    const queryParams = new URLSearchParams(this.queryString as any);
    queryParams.set("limit", String(this.limit));

    const buildUrl = (pageNum: number) =>
      `${baseUrl}?${queryParams
        .toString()
        .replace(/page=\d+/, "")}&page=${pageNum}`;

    return {
      data: results,
      pagination: {
        total,
        page: this.page,
        limit: this.limit,
        pages,
        next: this.page < pages ? buildUrl(this.page + 1) : undefined,
        prev: this.page > 1 ? buildUrl(this.page - 1) : undefined,
      },
    };
  }
}
