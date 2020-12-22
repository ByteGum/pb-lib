import { Document } from 'mongoose';
import { Pagination, QueryParser } from '../common';

export interface ResponseOption {
  value: any | Document;
  code: number;
  queryParser?: QueryParser;
  pagination?: Pagination;
  hiddenFields?: string[];
  message?: string;
  count?: number;
  token?: string;
}
