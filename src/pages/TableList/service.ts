import requestOld from '@/utils/request-mock';
import type { TableListParams, TableListItem } from './data.d';

export async function queryRule(params?: TableListParams) {
  return requestOld('/api/rule', {
    params,
  });
}

export async function removeRule(params: { key: number[] }) {
  return requestOld('/api/rule', {
    method: 'POST',
    data: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params: TableListItem) {
  return requestOld('/api/rule', {
    method: 'POST',
    data: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateRule(params: TableListParams) {
  return requestOld('/api/rule', {
    method: 'POST',
    data: {
      ...params,
      method: 'update',
    },
  });
}
