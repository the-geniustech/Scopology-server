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

type PopulateConfig = {
  path: string;
  select?: string;
  match?: Record<string, any>;
};

export class AdvancedAPIFeatures<T> {
  private query: Query<T[], T>;
  private queryString: Record<string, any>;
  private page = 1;
  private limit = 20;
  private baseFilter: Record<string, any> = {};
  private populates: PopulateConfig[] = [];

  constructor(query: Query<T[], T>, queryString: Record<string, any>) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excluded = ["page", "sort", "limit", "fields"];
    const baseQuery: Record<string, any> = {};
    const refMatch: Record<string, Record<string, any>> = {};

    for (const key in this.queryString) {
      if (excluded.includes(key)) continue;

      // Handle nested filters e.g. scope[status]=pending
      if (key.includes("[")) {
        const [ref, field] = key.split(/\[|\]/).filter(Boolean);
        if (!refMatch[ref]) refMatch[ref] = {};
        refMatch[ref][field] = this.queryString[key];
      } else {
        baseQuery[key] = this.queryString[key];
      }
    }

    this.baseFilter = baseQuery;

    // Store match conditions to apply during .populate()
    for (const ref in refMatch) {
      this.populates.push({
        path: ref,
        match: refMatch[ref],
      });
    }

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
    const nestedFields: Record<string, string> = {};

    // Handle fields[scope]=scopeTitle,status
    for (const key in this.queryString) {
      const match = key.match(/^fields\[(\w+)]$/);
      if (match) {
        const ref = match[1];
        nestedFields[ref] = this.queryString[key].split(",").join(" ");
      }
    }

    // Base fields
    if (baseFields && typeof baseFields === "string") {
      const selectFields = baseFields.split(",").join(" ");
      this.query = this.query.select(selectFields);
    } else {
      this.query = this.query.select("-__v");
    }

    // Merge field selections into populates
    this.populates = this.populates.map((p) => ({
      ...p,
      select: nestedFields[p.path] || p.select,
    }));

    return this;
  }

  paginate() {
    this.page = parseInt(this.queryString.page, 10) || 1;
    this.limit = parseInt(this.queryString.limit, 10) || 20;
    const skip = (this.page - 1) * this.limit;

    this.query = this.query.skip(skip).limit(this.limit);
    return this;
  }

  populate() {
    this.populates.forEach((p) => {
      this.query = this.query.populate(p);
    });
    return this;
  }

  async applyAll(baseUrl: string): Promise<{
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
    // Apply query features
    this.filter().sort().limitFields().paginate().populate();

    const countQuery = this.query.model.countDocuments(this.baseFilter);
    const [results, total] = await Promise.all([this.query, countQuery]);

    const pages = Math.ceil(total / this.limit);
    const queryParams = new URLSearchParams(this.queryString as any);
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
}
