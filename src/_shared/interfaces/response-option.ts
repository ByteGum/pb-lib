import { Document } from 'mongoose';
import { QueryParser, Pagination } from '../common';

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
