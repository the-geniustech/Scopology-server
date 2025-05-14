import { Query, Document, Model } from "mongoose";
import { URLSearchParams } from "url";
import AppError from "./appError";

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

interface QueryString {
  [key: string]: any;
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
  private query: Query<T[], T>;
  private model: Model<T>;
  private queryString: QueryString;
  private page = 1;
  private limit = 20;
  private baseUrl = "";
  private rootSelect = "";
  private populates: { path: string; select?: string }[] = [];

  constructor(model: Model<T>, query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.model = model;
    this.queryString = queryString;
  }

  async applyAll(baseUrl?: string): Promise<{
    data: T[];
    pagination: PaginationMeta;
  }> {
    if (baseUrl) this.baseUrl = baseUrl;

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
        ? `${this.baseUrl}?${queryParams
            .toString()
            .replace(/page=\d+/, "")}&page=${this.page + 1}`
        : undefined;

    const prev =
      this.page > 1
        ? `${this.baseUrl}?${queryParams
            .toString()
            .replace(/page=\d+/, "")}&page=${this.page - 1}`
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

  private filter() {
    const filterQuery = { ...this.queryString };
    const excluded = ["sort", "page", "limit", "fields"];

    Object.keys(filterQuery).forEach((key) => {
      if (excluded.includes(key) || key.startsWith("fields")) return;

      // Handle nested filters like client[clientName] or scope[status]
      const realKey = key.replace(/\[(.+?)\]/g, ".$1");
      const value = filterQuery[key];

      try {
        this.query = this.query.find({
          ...this.query.getFilter(),
          [realKey]: value,
        });
      } catch (err) {
        throw new AppError(`Invalid filter on field '${realKey}'`, 400);
      }
    });

    return this;
  }

  private sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(",")
        .map((field: string) => field.replace(/\[(.+?)\]/g, ".$1"))
        .join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  private limitFields() {
    const rootFields = this.queryString.fields;
    if (typeof rootFields === "string") {
      this.rootSelect = rootFields.split(",").join(" ");
      this.query = this.query.select(this.rootSelect);
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

  private paginate() {
    this.page = parseInt(this.queryString.page, 10) || 1;
    this.limit = parseInt(this.queryString.limit, 10) || 20;
    const skip = (this.page - 1) * this.limit;

    this.query = this.query.skip(skip).limit(this.limit);
    return this;
  }

  private populate() {
    for (const pop of this.populates) {
      this.query = this.query.populate({ ...pop, strictPopulate: false });
    }
    return this;
  }
}
