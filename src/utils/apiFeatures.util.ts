import { Query, Document, Model } from "mongoose";
import { URLSearchParams } from "url";
import AppError from "./appError";

export class APIFeatures<T> {
  private query: Query<T[], T>;
  private queryString: Record<string, any>;
  private page = 1;
  private limit = 20;
  private populates: { path: string; select?: string }[] = [];

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

  // limitFields() {
  //   if (this.queryString.fields) {
  //     const fields = this.queryString.fields.split(",").join(" ");
  //     this.query = this.query.select(fields);
  //   } else {
  //     this.query = this.query.select("-__v");
  //   }
  //   return this;
  // }

  limitFields() {
    const flatFields = this.queryString.fields;
    if (typeof flatFields === "string") {
      const selected = flatFields.split(",").join(" ");
      this.query = this.query.select(selected);
    }

    for (const key in this.queryString) {
      const match = key.match(/^fields\[(.+?)\]$/);
      if (match) {
        const path = match[1];
        const select = this.queryString[key];
        if (typeof select === "string") {
          this.populates.push({
            path,
            select: select.split(",").join(" "),
          });
        }
      }
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

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  next?: string;
  prev?: string;
}

export class AdvancedAPIFeatures<T extends Document> {
  private model: Model<T>;
  private query: Query<T[], T>;
  private queryString: Record<string, any>;
  private populates: { path: string; select?: string }[] = [];
  private page = 1;
  private limit = 20;

  constructor(
    model: Model<T>,
    query: Query<T[], T>,
    queryString: Record<string, any>
  ) {
    this.model = model;
    this.query = query;
    this.queryString = queryString;
  }

  async applyAll(baseUrl?: string): Promise<{
    data: T[];
    pagination: PaginationMeta;
  }> {
    this.filter().sort().limitFields().paginate().populate();

    const [results, total] = await Promise.all([
      this.query,
      this.model.countDocuments(this.query.getFilter()),
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
    const queryObj: Record<string, any> = {};
    const excluded = ["page", "sort", "limit", "fields"];

    for (const key in this.queryString) {
      if (excluded.includes(key) || key.startsWith("fields[")) continue;

      // support dot notation like scopeStatus=active or projectTitle=XYZ
      if (typeof this.queryString[key] === "object") {
        // e.g., gte, lte
        const operators = this.queryString[key];
        for (const op in operators) {
          if (/^(gte|gt|lte|lt|ne|in|nin)$/.test(op)) {
            queryObj[key] = { [`$${op}`]: operators[op] };
          }
        }
      } else {
        queryObj[key] = this.queryString[key];
      }
    }

    this.query = this.query.find(queryObj);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(",")
        .filter((field: string) => !field.includes("["))
        .join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    const flatFields = this.queryString.fields;
    if (typeof flatFields === "string") {
      const selected = flatFields.split(",").join(" ");
      this.query = this.query.select(selected);
    }

    for (const key in this.queryString) {
      const match = key.match(/^fields\[(.+?)\]$/);
      if (match) {
        const path = match[1];
        const select = this.queryString[key];
        if (typeof select === "string") {
          this.populates.push({
            path,
            select: select.split(",").join(" "),
          });
        }
      }
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

  populate() {
    this.populates.forEach((pop) => {
      this.query = this.query.populate({ ...pop, strictPopulate: false });
    });
    return this;
  }
}
